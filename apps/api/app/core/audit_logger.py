"""
Enterprise Audit Logging System
Tamper-proof audit logs with hash chain for compliance
"""

import hashlib
import json
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from uuid import UUID
import structlog

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.sql import func

from app.models.enterprise import AuditLog, AuditEventType
from app.core.tenant_context import TenantContext

logger = structlog.get_logger()


class AuditLogger:
    """Enterprise audit logging with hash chain integrity"""

    def __init__(self):
        self._last_hash_cache: Dict[str, str] = {}

    async def log_event(
        self,
        session: AsyncSession,
        event_type: AuditEventType,
        event_name: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        event_data: Optional[Dict[str, Any]] = None,
        changes: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        service_account_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        compliance_tags: Optional[List[str]] = None
    ) -> AuditLog:
        """
        Create a tamper-proof audit log entry

        Args:
            session: Database session
            event_type: Category of event (AUTH, ACCESS, MODIFY, etc.)
            event_name: Specific event name (e.g., "user.login", "role.created")
            resource_type: Type of resource affected
            resource_id: ID of resource affected
            event_data: Additional event context
            changes: Before/after values for modifications
            user_id: User who triggered the event
            service_account_id: Service account if applicable
            ip_address: Client IP address
            user_agent: Client user agent
            compliance_tags: Compliance frameworks (SOC2, HIPAA, etc.)

        Returns:
            Created audit log entry
        """

        try:
            # Get organization context
            org_id = TenantContext.get_organization_id()
            if not org_id:
                logger.warning("No organization context for audit log")
                return None

            # Get the previous hash for this organization
            previous_hash = await self._get_previous_hash(session, org_id)

            # Create the audit log entry
            audit_log = AuditLog(
                organization_id=UUID(org_id),
                user_id=UUID(user_id) if user_id else None,
                service_account_id=UUID(service_account_id) if service_account_id else None,
                ip_address=ip_address,
                user_agent=user_agent,
                event_type=event_type,
                event_name=event_name,
                resource_type=resource_type,
                resource_id=resource_id,
                event_data=event_data or {},
                changes=changes,
                compliance_tags=compliance_tags or [],
                previous_hash=previous_hash,
                retention_until=self._calculate_retention(compliance_tags)
            )

            # Calculate the hash for this entry
            audit_log.current_hash = self._calculate_hash(audit_log)

            # Add to session
            session.add(audit_log)
            await session.flush()

            # Update cache
            self._last_hash_cache[org_id] = audit_log.current_hash

            logger.info(
                "Audit event logged",
                event_type=event_type.value,
                event_name=event_name,
                resource_type=resource_type,
                resource_id=resource_id,
                organization_id=org_id
            )

            return audit_log

        except Exception as e:
            logger.error("Failed to create audit log", error=str(e))
            # Audit logging failures should not break the application
            return None

    async def verify_integrity(
        self,
        session: AsyncSession,
        organization_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Verify the integrity of the audit log hash chain

        Args:
            session: Database session
            organization_id: Organization to verify
            start_date: Start of verification period
            end_date: End of verification period

        Returns:
            Verification results including any broken links
        """

        try:
            # Build query
            query = select(AuditLog).where(
                AuditLog.organization_id == organization_id
            ).order_by(AuditLog.created_at)

            if start_date:
                query = query.where(AuditLog.created_at >= start_date)
            if end_date:
                query = query.where(AuditLog.created_at <= end_date)

            # Get all logs in order
            result = await session.execute(query)
            logs = result.scalars().all()

            if not logs:
                return {
                    "verified": True,
                    "total_entries": 0,
                    "message": "No audit logs to verify"
                }

            # Verify the chain
            broken_links = []
            previous_hash = None

            for i, log in enumerate(logs):
                # Check if previous hash matches
                if i > 0 and log.previous_hash != previous_hash:
                    broken_links.append({
                        "position": i,
                        "log_id": str(log.id),
                        "expected_previous": previous_hash,
                        "actual_previous": log.previous_hash,
                        "timestamp": log.created_at.isoformat()
                    })

                # Recalculate hash and verify
                calculated_hash = self._calculate_hash(log)
                if calculated_hash != log.current_hash:
                    broken_links.append({
                        "position": i,
                        "log_id": str(log.id),
                        "type": "hash_mismatch",
                        "expected_hash": calculated_hash,
                        "actual_hash": log.current_hash,
                        "timestamp": log.created_at.isoformat()
                    })

                previous_hash = log.current_hash

            return {
                "verified": len(broken_links) == 0,
                "total_entries": len(logs),
                "broken_links": broken_links,
                "first_entry": logs[0].created_at.isoformat(),
                "last_entry": logs[-1].created_at.isoformat(),
                "message": "Audit log integrity verified" if not broken_links else f"Found {len(broken_links)} integrity violations"
            }

        except Exception as e:
            logger.error("Audit log verification failed", error=str(e))
            return {
                "verified": False,
                "error": str(e),
                "message": "Verification failed due to error"
            }

    async def query_logs(
        self,
        session: AsyncSession,
        organization_id: Optional[str] = None,
        user_id: Optional[str] = None,
        event_type: Optional[AuditEventType] = None,
        event_name: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        compliance_tag: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AuditLog]:
        """
        Query audit logs with filtering

        Args:
            Various filter parameters

        Returns:
            List of matching audit logs
        """

        # Build query
        query = select(AuditLog)
        conditions = []

        # Apply filters
        if organization_id:
            conditions.append(AuditLog.organization_id == organization_id)
        else:
            # Use tenant context if not specified
            org_id = TenantContext.get_organization_id()
            if org_id:
                conditions.append(AuditLog.organization_id == org_id)

        if user_id:
            conditions.append(AuditLog.user_id == user_id)

        if event_type:
            conditions.append(AuditLog.event_type == event_type)

        if event_name:
            conditions.append(AuditLog.event_name == event_name)

        if resource_type:
            conditions.append(AuditLog.resource_type == resource_type)

        if resource_id:
            conditions.append(AuditLog.resource_id == resource_id)

        if start_date:
            conditions.append(AuditLog.created_at >= start_date)

        if end_date:
            conditions.append(AuditLog.created_at <= end_date)

        if compliance_tag:
            conditions.append(AuditLog.compliance_tags.contains([compliance_tag]))

        if conditions:
            query = query.where(and_(*conditions))

        # Order by creation time (newest first)
        query = query.order_by(desc(AuditLog.created_at))

        # Apply pagination
        query = query.offset(offset).limit(limit)

        # Execute query
        result = await session.execute(query)
        return result.scalars().all()

    async def export_logs(
        self,
        session: AsyncSession,
        organization_id: str,
        format: str = "json",
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        compliance_filter: Optional[str] = None
    ) -> str:
        """
        Export audit logs for compliance reporting

        Args:
            session: Database session
            organization_id: Organization to export
            format: Export format (json, csv, siem)
            start_date: Start of export period
            end_date: End of export period
            compliance_filter: Filter by compliance tag

        Returns:
            Exported data as string
        """

        # Query logs
        logs = await self.query_logs(
            session=session,
            organization_id=organization_id,
            start_date=start_date,
            end_date=end_date,
            compliance_tag=compliance_filter,
            limit=10000  # Reasonable limit for export
        )

        if format == "json":
            return self._export_json(logs)
        elif format == "csv":
            return self._export_csv(logs)
        elif format == "siem":
            return self._export_siem(logs)
        else:
            raise ValueError(f"Unsupported export format: {format}")

    # Private helper methods

    async def _get_previous_hash(self, session: AsyncSession, organization_id: str) -> Optional[str]:
        """Get the hash of the most recent audit log for the organization"""

        # Check cache first
        if organization_id in self._last_hash_cache:
            return self._last_hash_cache[organization_id]

        # Query database for last entry
        result = await session.execute(
            select(AuditLog.current_hash)
            .where(AuditLog.organization_id == organization_id)
            .order_by(desc(AuditLog.created_at))
            .limit(1)
        )

        last_hash = result.scalar_one_or_none()

        if last_hash:
            self._last_hash_cache[organization_id] = last_hash

        return last_hash

    def _calculate_hash(self, audit_log: AuditLog) -> str:
        """Calculate SHA-256 hash for an audit log entry"""

        # Create a deterministic string representation
        hash_input = json.dumps({
            "organization_id": str(audit_log.organization_id),
            "user_id": str(audit_log.user_id) if audit_log.user_id else None,
            "event_type": audit_log.event_type.value,
            "event_name": audit_log.event_name,
            "resource_type": audit_log.resource_type,
            "resource_id": audit_log.resource_id,
            "event_data": audit_log.event_data,
            "changes": audit_log.changes,
            "ip_address": audit_log.ip_address,
            "previous_hash": audit_log.previous_hash,
            "timestamp": audit_log.created_at.isoformat() if audit_log.created_at else datetime.utcnow().isoformat()
        }, sort_keys=True)

        return hashlib.sha256(hash_input.encode()).hexdigest()

    def _calculate_retention(self, compliance_tags: Optional[List[str]]) -> datetime:
        """Calculate retention period based on compliance requirements"""

        # Default retention: 2 years
        retention_days = 730

        if compliance_tags:
            # Compliance-specific retention requirements
            if "HIPAA" in compliance_tags:
                retention_days = 2190  # 6 years
            elif "SOC2" in compliance_tags:
                retention_days = 2555  # 7 years
            elif "GDPR" in compliance_tags:
                retention_days = 1095  # 3 years
            elif "PCI-DSS" in compliance_tags:
                retention_days = 365  # 1 year minimum

        return datetime.utcnow() + timedelta(days=retention_days)

    def _export_json(self, logs: List[AuditLog]) -> str:
        """Export logs as JSON"""

        export_data = []
        for log in logs:
            export_data.append({
                "id": str(log.id),
                "timestamp": log.created_at.isoformat(),
                "organization_id": str(log.organization_id),
                "user_id": str(log.user_id) if log.user_id else None,
                "event_type": log.event_type.value,
                "event_name": log.event_name,
                "resource_type": log.resource_type,
                "resource_id": log.resource_id,
                "event_data": log.event_data,
                "changes": log.changes,
                "ip_address": log.ip_address,
                "user_agent": log.user_agent,
                "compliance_tags": log.compliance_tags,
                "hash": log.current_hash
            })

        return json.dumps(export_data, indent=2)

    def _export_csv(self, logs: List[AuditLog]) -> str:
        """Export logs as CSV"""

        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow([
            "Timestamp", "Organization ID", "User ID", "Event Type",
            "Event Name", "Resource Type", "Resource ID", "IP Address",
            "Compliance Tags", "Hash"
        ])

        # Data rows
        for log in logs:
            writer.writerow([
                log.created_at.isoformat(),
                str(log.organization_id),
                str(log.user_id) if log.user_id else "",
                log.event_type.value,
                log.event_name,
                log.resource_type or "",
                log.resource_id or "",
                log.ip_address or "",
                ",".join(log.compliance_tags) if log.compliance_tags else "",
                log.current_hash
            ])

        return output.getvalue()

    def _export_siem(self, logs: List[AuditLog]) -> str:
        """Export logs in SIEM format (CEF - Common Event Format)"""

        siem_logs = []

        for log in logs:
            # CEF format: CEF:Version|Device Vendor|Device Product|Device Version|Device Event Class ID|Name|Severity|[Extension]
            cef_log = (
                f"CEF:0|Janua|AuditLog|1.0|{log.event_type.value}|{log.event_name}|3|"
                f"duid={log.user_id if log.user_id else 'system'} "
                f"src={log.ip_address or 'unknown'} "
                f"act={log.event_name} "
                f"dvc={log.organization_id} "
                f"cs1Label=ResourceType cs1={log.resource_type or 'none'} "
                f"cs2Label=ResourceID cs2={log.resource_id or 'none'} "
                f"cs3Label=Hash cs3={log.current_hash}"
            )
            siem_logs.append(cef_log)

        return "\n".join(siem_logs)


# Audit event decorators for automatic logging

def audit_event(
    event_type: AuditEventType,
    event_name: str,
    resource_type: Optional[str] = None
):
    """Decorator to automatically log audit events for endpoints"""

    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract necessary information from kwargs
            db = kwargs.get('db')
            current_user_id = kwargs.get('current_user_id')
            request = kwargs.get('request')

            # Get resource ID from path parameters if available
            resource_id = kwargs.get('id') or kwargs.get('resource_id')

            # Execute the function
            result = await func(*args, **kwargs)

            # Log the audit event
            if db:
                audit_logger = AuditLogger()
                await audit_logger.log_event(
                    session=db,
                    event_type=event_type,
                    event_name=event_name,
                    resource_type=resource_type,
                    resource_id=str(resource_id) if resource_id else None,
                    user_id=current_user_id,
                    ip_address=request.client.host if request and request.client else None,
                    user_agent=request.headers.get("user-agent") if request else None,
                    event_data={"result": "success"}
                )

            return result

        return wrapper
    return decorator


# Global audit logger instance
audit_logger = AuditLogger()