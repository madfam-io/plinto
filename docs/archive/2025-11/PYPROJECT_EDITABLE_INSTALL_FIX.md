# pyproject.toml Editable Install Fix

**Date**: November 14, 2025  
**Issue**: Hatchling refusing editable install due to `sources` path rewrite  
**Status**: ✅ RESOLVED

---

## Problem Summary

Python editable install (`pip install -e .`) was failing with hatchling build backend error:

```
ValueError: Dev mode installations are unsupported when any path rewrite 
in the `sources` option changes a prefix rather than removes it, 
see: https://github.com/pfmoore/editables/issues/20
```

## Root Cause

The original `pyproject.toml` configuration only included the `app` package in the wheel build:

```toml
[tool.hatch.build.targets.wheel]
packages = ["app"]
```

However, the project structure includes **two** packages:
1. **`app/`** - Core FastAPI application with all business logic
2. **`janua/`** - CLI and middleware wrapper that provides public API

The CLI entry point expects the `janua` package:
```toml
[project.scripts]
janua = "janua.cli:cli_main"
```

When only `app` was included, the build system couldn't find the `janua` package referenced by the CLI entry point during editable install.

## Project Structure

```
apps/api/
├── app/                    # Core application (auth, core, compliance, etc.)
│   ├── __init__.py        # Contains __version__
│   ├── auth/
│   ├── core/
│   ├── compliance/
│   └── ...
├── janua/                 # CLI and middleware wrapper
│   ├── __init__.py
│   ├── cli.py             # CLI entry point
│   └── middleware.py      # Middleware stack
├── alembic/               # Database migrations
├── tests/                 # Test files
└── pyproject.toml
```

## Solution

Include **both** packages in the wheel build configuration:

```toml
[tool.hatch.build.targets.wheel]
packages = ["app", "janua"]
```

This allows:
- The `app` package to contain the core FastAPI application
- The `janua` package to provide the CLI interface (`janua` command)
- Both packages to be installed correctly in editable mode

## Why Two Packages?

The dual-package structure provides clean separation:

**`app/` Package (Internal)**:
- Contains the actual FastAPI application
- Handles authentication, authorization, compliance, etc.
- Can be imported by other applications: `from app.core import ...`

**`janua/` Package (Public API)**:
- Provides the CLI interface (`janua server`, `janua migrate`, etc.)
- Wraps the `app` package with public entry points
- Provides middleware registration for FastAPI
- Clean public API for library consumers

## Affected Workflows

Three GitHub Actions workflows use editable installs and are now fixed:

1. **`.github/workflows/sdk-publish.yml`** (line 129)
   ```yaml
   pip install -e .
   ```

2. **`.github/workflows/tests.yml`** (line 57)
   ```yaml
   pip install -e ".[dev]"
   ```

3. **`.github/workflows/sdk-ci.yml`** (line 89)
   ```yaml
   pip install -e .[dev]
   ```

## Verification

To verify the fix locally:

```bash
cd apps/api

# Test editable install (dry-run)
python -m pip install -e . --dry-run

# Actual editable install
pip install -e ".[dev]"

# Verify CLI works
janua --version
janua health
```

## CLI Commands Available

Once installed, the `janua` CLI provides:

- `janua server` - Start the Janua server
- `janua migrate` - Run database migrations
- `janua create-user` - Create admin/user accounts
- `janua init` - Initialize configuration
- `janua health` - Check system health
- `janua version` - Show version information

## Entry Points

The fix ensures these entry points work correctly:

**CLI Entry Point**:
```toml
[project.scripts]
janua = "janua.cli:cli_main"
```

**Middleware Entry Point**:
```toml
[project.entry-points."fastapi.middleware"]
janua = "janua.middleware:get_middleware_stack"
```

**Auth Provider Entry Points**:
```toml
[project.entry-points."janua.auth_providers"]
jwt = "janua.auth.providers.jwt:JWTAuthProvider"
oauth = "janua.auth.providers.oauth:OAuthProvider"
saml = "janua.auth.providers.saml:SAMLProvider"
webauthn = "janua.auth.providers.webauthn:WebAuthnProvider"
```

## Related Issues

This fix resolves:
- ✅ Editable install failures in CI/CD workflows
- ✅ Local development setup issues
- ✅ CLI command registration problems
- ✅ Entry point resolution errors

## Prevention

For future package structure changes:

1. **Always include all packages** referenced by entry points in `packages = [...]`
2. **Test editable installs locally** before committing `pyproject.toml` changes
3. **Use dry-run first**: `pip install -e . --dry-run` to catch build errors
4. **Verify entry points** with `pip show -f janua` after installation

## References

- Hatchling build system: https://hatchling.pypa.io/
- PEP 660 (Editable Installs): https://peps.python.org/pep-0660/
- Entry Points specification: https://packaging.python.org/specifications/entry-points/
- Issue discussion: https://github.com/pfmoore/editables/issues/20
