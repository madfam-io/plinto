# CC6: Logical and Physical Access Controls

**Control Category**: Security (Common Criteria)
**Control ID**: CC6
**Trust Services Criteria**: Security
**Implementation Status**: ✅ Implemented
**Last Review**: [Date]
**Next Review**: [Date + 1 Year]

## Control Objective

The entity implements logical and physical access controls to prevent unauthorized access to computing resources, software, data, and other protected items.

## Control Description

Plinto maintains comprehensive access controls that protect both logical (system) and physical (facility) access to information assets. This includes authentication systems, authorization mechanisms, physical security controls, and monitoring capabilities.

## Sub-Controls

### CC6.1: Logical Access Controls

#### CC6.1.1 Authentication Systems
**Control Statement**: The entity implements strong authentication mechanisms for all system access.

**Plinto Implementation**:
- Multi-factor authentication (MFA) required for all administrative access
- TOTP-based MFA using industry-standard pyotp library
- WebAuthn/Passkey support for passwordless authentication
- JWT-based session management with refresh token rotation
- Password strength requirements with bcrypt hashing (12 rounds)

**Technical Implementation**:
```python
# Location: /apps/api/app/main.py:16-20
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Strong rounds for security
)
```

**Evidence Sources**:
- Authentication logs in application audit trail
- MFA enrollment reports from user management system
- Password policy configuration documentation
- JWT token validation logs

#### CC6.1.2 Authorization and Access Management
**Control Statement**: The entity implements role-based access control and principle of least privilege.

**Plinto Implementation**:
- Role-Based Access Control (RBAC) system with granular permissions
- Organization-level access segregation
- Privileged access management for administrative functions
- Regular access reviews and certification processes
- Automated access provisioning and deprovisioning

**Technical Implementation**:
```python
# Location: /apps/api/app/routers/v1/rbac.py
# Comprehensive RBAC implementation with:
# - Role definitions and permission mappings
# - Organization-level access controls
# - Administrative privilege management
# - Access audit capabilities
```

**Evidence Sources**:
- User access reports from RBAC system
- Role assignment logs and approvals
- Privileged access monitoring logs
- Access review documentation and sign-offs

#### CC6.1.3 Session Management
**Control Statement**: The entity implements secure session management practices.

**Plinto Implementation**:
- Redis-based session storage with encryption
- Session timeout and automatic logout
- Concurrent session limits
- Session invalidation on suspicious activity
- Secure session token handling

**Technical Implementation**:
```python
# Location: /apps/api/app/routers/v1/sessions.py
# Session management with:
# - Secure session creation and validation
# - Multi-device session tracking
# - Session lifecycle management
# - Administrative session control
```

**Evidence Sources**:
- Session management logs
- Redis session storage configuration
- Session timeout policy documentation
- Concurrent session monitoring reports

### CC6.2: Network Access Controls

#### CC6.2.1 Network Segmentation
**Control Statement**: The entity implements network segmentation to control access between system components.

**Plinto Implementation**:
- Docker network isolation using dedicated bridge networks
- Service-to-service communication controls
- Database and Redis isolation from external networks
- API gateway pattern for external access control
- Internal service mesh for secure inter-service communication

**Technical Implementation**:
```yaml
# Location: docker-compose.yml
networks:
  plinto-network:
    driver: bridge
    # Isolated network for all Plinto services
```

**Evidence Sources**:
- Network topology documentation
- Docker network configuration files
- Service communication logs
- Network monitoring reports

#### CC6.2.2 Firewall and Security Controls
**Control Statement**: The entity implements network security controls including firewall rules and intrusion detection.

**Plinto Implementation**:
- Application-level firewall rules via reverse proxy
- Rate limiting middleware for API protection
- Security headers for web application security
- Trusted host middleware for domain validation
- Input validation and sanitization controls

**Technical Implementation**:
```python
# Location: /apps/api/app/main.py:128-142
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Security headers for A+ SSL rating
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        # ... additional security headers
```

**Evidence Sources**:
- Security header configuration documentation
- Rate limiting logs and metrics
- Firewall rule documentation
- Security scanning reports

### CC6.3: Data Access Controls

#### CC6.3.1 Data Classification and Handling
**Control Statement**: The entity implements data classification and appropriate access controls based on data sensitivity.

**Plinto Implementation**:
- Data classification schema (Public, Internal, Confidential, Restricted)
- Encryption at rest for sensitive data
- Encryption in transit for all data transmissions
- Database access controls and query logging
- Data loss prevention controls

**Technical Implementation**:
```python
# Database encryption and access controls
# - PostgreSQL with encrypted connections
# - Redis with authentication and encryption
# - Application-level data encryption for sensitive fields
# - Database connection pooling with access controls
```

**Evidence Sources**:
- Data classification policy documentation
- Database encryption configuration
- Data access logs and monitoring
- Encryption key management documentation

#### CC6.3.2 Database Security
**Control Statement**: The entity implements comprehensive database security controls.

**Plinto Implementation**:
- Database authentication and authorization
- SQL injection prevention via ORM usage
- Database connection encryption
- Query logging and monitoring
- Regular database security assessments

**Technical Implementation**:
```python
# Location: /apps/api/app/core/database.py
# Database security features:
# - Parameterized queries via SQLAlchemy ORM
# - Connection pooling with authentication
# - Query logging and monitoring
# - Transaction management
```

**Evidence Sources**:
- Database configuration documentation
- Query logs and audit trails
- Database security scan results
- Access control implementation documentation

### CC6.4: Physical Access Controls

#### CC6.4.1 Data Center Security
**Control Statement**: The entity implements physical security controls for computing infrastructure.

**Plinto Implementation**:
- Cloud infrastructure hosted on Railway platform
- Physical security controls inherited from cloud provider
- Multi-factor authentication for cloud platform access
- Infrastructure access logging and monitoring
- Vendor security attestations and certifications

**Technical Implementation**:
- Railway platform SOC2 Type II compliance
- Infrastructure-as-Code deployment
- Encrypted data storage in cloud environment
- Network isolation and security groups
- Regular security assessments of cloud provider

**Evidence Sources**:
- Cloud provider SOC2 reports
- Infrastructure access logs
- Vendor security certifications
- Platform security configuration documentation

#### CC6.4.2 Equipment and Media Security
**Control Statement**: The entity implements controls for secure handling of computing equipment and media.

**Plinto Implementation**:
- Secure disposal procedures for hardware and media
- Asset inventory and lifecycle management
- Secure data destruction verification
- Media handling and transport security
- Environmental controls for equipment protection

**Evidence Sources**:
- Asset inventory documentation
- Secure disposal certificates
- Media handling procedures
- Environmental monitoring reports

### CC6.5: Access Monitoring and Review

#### CC6.5.1 Access Monitoring
**Control Statement**: The entity implements continuous monitoring of access activities.

**Plinto Implementation**:
- Comprehensive audit logging of all access activities
- Real-time monitoring and alerting for suspicious activities
- Failed authentication attempt tracking
- Privileged access monitoring and reporting
- Access pattern analysis and anomaly detection

**Technical Implementation**:
```python
# Location: /apps/api/app/core/audit_logger.py
# Comprehensive audit logging:
# - Authentication events
# - Authorization decisions
# - Data access activities
# - Administrative actions
# - System changes
```

**Evidence Sources**:
- Audit logs and access reports
- Security monitoring alerts
- Failed authentication reports
- Privileged access logs

#### CC6.5.2 Access Reviews and Certification
**Control Statement**: The entity conducts regular reviews of user access rights and certifications.

**Plinto Implementation**:
- Quarterly access reviews by data owners
- Annual certification of user access rights
- Automated detection of excessive privileges
- Prompt access revocation for terminated users
- Documentation of access review results

**Evidence Sources**:
- Access review documentation and sign-offs
- User termination procedures and logs
- Access certification reports
- Privilege escalation justifications

## Control Testing Procedures

### Design Testing
1. **Review**: Access control policies and procedures
2. **Walkthrough**: Authentication and authorization processes
3. **Verification**: Technical implementation documentation
4. **Assessment**: Control design adequacy

### Operating Effectiveness Testing
1. **Authentication Testing**: Sample authentication events
2. **Authorization Testing**: Verify RBAC implementation
3. **Access Review Testing**: Review access certification process
4. **Monitoring Testing**: Verify access monitoring effectiveness

### Evidence Requirements
- Access control policy documentation
- User access reports and reviews
- Authentication and authorization logs
- Security monitoring reports and alerts
- Vendor security attestations

## Control Metrics and KPIs

### Authentication Metrics
- Multi-factor authentication enrollment rate: >95%
- Failed authentication attempts: <1% of total attempts
- Password policy compliance: 100%
- Session timeout compliance: 100%

### Authorization Metrics
- Access review completion rate: 100% quarterly
- Privileged access justification rate: 100%
- Access revocation timeliness: <24 hours
- RBAC policy compliance: 100%

### Monitoring Metrics
- Security alert resolution time: <4 hours
- Access anomaly detection rate: >90%
- Audit log completeness: 100%
- Monitoring system uptime: >99.9%

## Remediation Procedures

### Control Failures
1. **Immediate**: Isolate affected systems or users
2. **Investigation**: Determine root cause and scope
3. **Remediation**: Implement corrective actions
4. **Validation**: Verify control restoration
5. **Documentation**: Record incident and lessons learned

### Non-Compliance Issues
1. **Identification**: Detect policy violations
2. **Assessment**: Evaluate risk and impact
3. **Correction**: Implement compliance measures
4. **Monitoring**: Verify ongoing compliance
5. **Training**: Provide additional education if needed

## Related Controls
- **CC1**: Control Environment (Governance)
- **CC2**: Communication and Information (Policy Communication)
- **CC5**: Control Activities (Complementary Controls)
- **CC7**: System Operations (Operational Security)
- **C1**: Confidential Information (Data Protection)

## Compliance Mapping
- **SOC2**: CC6 Logical and Physical Access Controls
- **NIST CSF**: PR.AC (Access Control), PR.DS (Data Security)
- **ISO 27001**: A.9 (Access Control), A.11 (Physical Security)
- **CIS Controls**: 4 (Controlled Use of Administrative Privileges), 16 (Account Monitoring)

---

*This control documentation demonstrates Plinto's comprehensive access control implementation and provides the framework for SOC2 Type II audit evidence collection.*