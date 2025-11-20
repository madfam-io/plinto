#!/usr/bin/env python3
"""
Auth0 to Plinto Migration Tool

Exports users from Auth0 and imports them into Plinto.
Handles password hashes, user metadata, and generates a migration report.

Usage:
    python auth0_migrate.py --config config.json
    python auth0_migrate.py --export-only  # Just export from Auth0
    python auth0_migrate.py --import-only users.json  # Just import to Plinto
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import requests
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.table import Table
except ImportError:
    print("Missing dependencies. Install with:")
    print("  pip install requests rich")
    sys.exit(1)


console = Console()


class Auth0Client:
    """Client for Auth0 Management API."""

    def __init__(self, domain: str, client_id: str, client_secret: str):
        self.domain = domain
        self.client_id = client_id
        self.client_secret = client_secret
        self.access_token: Optional[str] = None

    def authenticate(self) -> None:
        """Get Auth0 Management API access token."""
        console.print("[blue]Authenticating with Auth0...[/blue]")

        response = requests.post(
            f"https://{self.domain}/oauth/token",
            json={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "audience": f"https://{self.domain}/api/v2/",
                "grant_type": "client_credentials",
            },
        )

        if response.status_code != 200:
            console.print(f"[red]Auth failed: {response.text}[/red]")
            sys.exit(1)

        self.access_token = response.json()["access_token"]
        console.print("[green]✓ Authenticated[/green]")

    def export_users(self, page_size: int = 100) -> List[Dict[str, Any]]:
        """Export all users from Auth0."""
        if not self.access_token:
            self.authenticate()

        console.print("[blue]Exporting users from Auth0...[/blue]")

        users = []
        page = 0

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
        ) as progress:
            task = progress.add_task("Fetching users...", total=None)

            while True:
                response = requests.get(
                    f"https://{self.domain}/api/v2/users",
                    headers={"Authorization": f"Bearer {self.access_token}"},
                    params={
                        "page": page,
                        "per_page": page_size,
                        "include_totals": "true",
                    },
                )

                if response.status_code != 200:
                    console.print(f"[red]Export failed: {response.text}[/red]")
                    sys.exit(1)

                data = response.json()
                users.extend(data["users"])

                progress.update(
                    task, description=f"Fetched {len(users)} users..."
                )

                if len(users) >= data["total"]:
                    break

                page += 1

        console.print(f"[green]✓ Exported {len(users)} users[/green]")
        return users


class PlintoClient:
    """Client for Plinto API."""

    def __init__(self, api_url: str, admin_token: str):
        self.api_url = api_url.rstrip("/")
        self.admin_token = admin_token

    def import_users(
        self, users: List[Dict[str, Any]], skip_existing: bool = True
    ) -> Dict[str, Any]:
        """Import users into Plinto."""
        console.print(f"[blue]Importing {len(users)} users to Plinto...[/blue]")

        results = {
            "success": 0,
            "failed": 0,
            "skipped": 0,
            "errors": [],
        }

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
        ) as progress:
            task = progress.add_task("Importing users...", total=len(users))

            for user in users:
                try:
                    plinto_user = self._convert_auth0_user(user)

                    # Check if user exists
                    if skip_existing and self._user_exists(plinto_user["email"]):
                        results["skipped"] += 1
                        progress.advance(task)
                        continue

                    # Import user
                    response = requests.post(
                        f"{self.api_url}/v1/admin/users",
                        headers={
                            "Authorization": f"Bearer {self.admin_token}",
                            "Content-Type": "application/json",
                        },
                        json=plinto_user,
                    )

                    if response.status_code in (200, 201):
                        results["success"] += 1
                    else:
                        results["failed"] += 1
                        results["errors"].append(
                            {
                                "email": plinto_user["email"],
                                "error": response.text,
                            }
                        )

                except Exception as e:
                    results["failed"] += 1
                    results["errors"].append(
                        {
                            "email": user.get("email", "unknown"),
                            "error": str(e),
                        }
                    )

                progress.advance(task)

        console.print(
            f"[green]✓ Imported: {results['success']} | "
            f"Failed: {results['failed']} | "
            f"Skipped: {results['skipped']}[/green]"
        )

        return results

    def _convert_auth0_user(self, auth0_user: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Auth0 user format to Plinto format."""
        # Extract name components
        name = auth0_user.get("name", "")
        given_name = auth0_user.get("given_name", "")
        family_name = auth0_user.get("family_name", "")

        # Parse name if components not provided
        if not given_name and name:
            parts = name.split(" ", 1)
            given_name = parts[0]
            family_name = parts[1] if len(parts) > 1 else ""

        return {
            "email": auth0_user["email"],
            "email_verified": auth0_user.get("email_verified", False),
            "first_name": given_name,
            "last_name": family_name,
            "phone_number": auth0_user.get("phone_number"),
            "phone_verified": auth0_user.get("phone_verified", False),
            # Store original Auth0 user_id in metadata
            "metadata": {
                "auth0_user_id": auth0_user.get("user_id"),
                "migrated_from": "auth0",
                "migration_date": datetime.utcnow().isoformat(),
                **auth0_user.get("user_metadata", {}),
            },
            # Note: Password hashes cannot be migrated from Auth0
            # Users will need to reset their passwords
            "require_password_reset": True,
        }

    def _user_exists(self, email: str) -> bool:
        """Check if user already exists in Plinto."""
        response = requests.get(
            f"{self.api_url}/v1/admin/users",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            params={"email": email},
        )
        return response.status_code == 200 and len(response.json()) > 0


def generate_report(
    export_count: int,
    import_results: Dict[str, Any],
    output_file: Path,
) -> None:
    """Generate migration report."""
    report = {
        "migration_date": datetime.utcnow().isoformat(),
        "summary": {
            "exported_from_auth0": export_count,
            "imported_to_plinto": import_results["success"],
            "failed": import_results["failed"],
            "skipped": import_results["skipped"],
        },
        "errors": import_results["errors"],
    }

    with open(output_file, "w") as f:
        json.dump(report, f, indent=2)

    # Print summary table
    table = Table(title="Migration Summary")
    table.add_column("Metric", style="cyan")
    table.add_column("Count", justify="right", style="green")

    table.add_row("Exported from Auth0", str(export_count))
    table.add_row("Imported to Plinto", str(import_results["success"]))
    table.add_row("Skipped (existing)", str(import_results["skipped"]))
    table.add_row("Failed", str(import_results["failed"]), style="red")

    console.print(table)
    console.print(f"\n[green]Report saved to: {output_file}[/green]")

    if import_results["errors"]:
        console.print(f"\n[yellow]Errors ({len(import_results['errors'])})[/yellow]")
        for error in import_results["errors"][:10]:  # Show first 10
            console.print(f"  • {error['email']}: {error['error']}")
        if len(import_results["errors"]) > 10:
            console.print(f"  ... and {len(import_results['errors']) - 10} more")


def main():
    parser = argparse.ArgumentParser(
        description="Migrate users from Auth0 to Plinto"
    )
    parser.add_argument(
        "--config",
        type=Path,
        help="Path to config JSON file",
    )
    parser.add_argument(
        "--export-only",
        action="store_true",
        help="Only export from Auth0, don't import",
    )
    parser.add_argument(
        "--import-only",
        type=Path,
        help="Import users from JSON file (skip Auth0 export)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("migration_report.json"),
        help="Output path for migration report",
    )

    args = parser.parse_args()

    # Load config
    if not args.import_only and not args.config:
        console.print("[red]Error: --config required unless using --import-only[/red]")
        sys.exit(1)

    users = []

    # Export from Auth0
    if not args.import_only:
        with open(args.config) as f:
            config = json.load(f)

        auth0 = Auth0Client(
            domain=config["auth0"]["domain"],
            client_id=config["auth0"]["client_id"],
            client_secret=config["auth0"]["client_secret"],
        )

        users = auth0.export_users()

        # Save exported users
        export_file = Path("auth0_users.json")
        with open(export_file, "w") as f:
            json.dump(users, f, indent=2)
        console.print(f"[green]✓ Users saved to: {export_file}[/green]")

        if args.export_only:
            console.print("[blue]Export complete (--export-only mode)[/blue]")
            return

    # Import to Plinto
    if args.import_only:
        with open(args.import_only) as f:
            users = json.load(f)
        console.print(f"[blue]Loaded {len(users)} users from {args.import_only}[/blue]")

    if not args.config:
        console.print("[red]Error: --config required for import[/red]")
        sys.exit(1)

    with open(args.config) as f:
        config = json.load(f)

    plinto = PlintoClient(
        api_url=config["plinto"]["api_url"],
        admin_token=config["plinto"]["admin_token"],
    )

    results = plinto.import_users(users)

    # Generate report
    generate_report(len(users), results, args.output)

    console.print("\n[green]✓ Migration complete![/green]")


if __name__ == "__main__":
    main()
