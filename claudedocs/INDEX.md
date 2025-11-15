# Claude Internal Documentation Index

**Purpose**: Internal documentation for Claude Code sessions, implementation progress, and technical analysis.  
**Audience**: Development team, future Claude sessions  
**Last Updated**: November 15, 2025

## Directory Structure

```
claudedocs/
├── audits/                    # Comprehensive codebase audits
├── session-notes/             # Session summaries and breakthroughs
├── implementation-reports/     # Feature implementation and fix reports
├── guides/                    # Implementation guides and foundations
└── archive/                   # Superseded or historical documents
```

## Navigation

### 📊 Audits

**Current**:
- [2025-11-15 Codebase Audit](audits/2025-11-15-codebase-audit.md) - Comprehensive codebase analysis (pre-Phase 1-2 cleanup)

### 📝 Session Notes

**Recent Sessions**:
- [2025-11-13 Breakthrough Final](session-notes/2025-11-13-breakthrough-final.md) - Major testing breakthrough session
- [2025-11-13 Auth Endpoints](session-notes/2025-11-13-auth-endpoints.md) - Auth endpoint implementation session

### 🔧 Implementation Reports

**Infrastructure Fixes**:
- [JWT Fix Summary](implementation-reports/jwt-fix-summary.md) - JWT service implementation fixes
- [Redis Fix Summary](implementation-reports/redis-fix-summary.md) - Redis integration fixes
- [Fixture Injection Breakthrough](implementation-reports/fixture-injection-breakthrough.md) - Test fixture improvements

**Test Coverage**:
- [50% Coverage Achievement](implementation-reports/50pct-coverage-final.md) - Path to 50% test coverage
- [Auth Tests Final Report](implementation-reports/auth-tests-final-report.md) - Authentication testing completion
- [Auth Tests Final Status](implementation-reports/auth-tests-final-status.md) - Current auth test status

**Strategy**:
- [Critical Success Factors](implementation-reports/critical-success-factors.md) - Key implementation priorities

### 📖 Guides

**Foundation**:
- [Week 1 Foundation Complete](guides/week1-foundation-complete.md) - Week 1 milestone completion
- [Week 1 Implementation Guide](guides/week1-implementation-guide.md) - Week 1 implementation details

### 🗄️ Archive

**Superseded Documentation**:
- [Auth Tests Status](archive/auth-tests-status.md) - Superseded by final reports
- [Auth Tests Implementation Summary](archive/auth-tests-implementation-summary.md) - Earlier implementation notes

## Document Lifecycle

### Status Indicators

- **[CURRENT]** - Active, up-to-date documentation
- **[ARCHIVED]** - Historical, superseded by newer documents
- **[DRAFT]** - Work in progress, not finalized

### Naming Convention

All documents follow the pattern: `YYYY-MM-DD-descriptive-name.md` or `descriptive-name.md` for timeless guides.

### When to Archive

Documents should be moved to `archive/` when:
- Superseded by a newer, more comprehensive document
- Implementation phase is complete and historical reference only
- Content is outdated but valuable for context
- Age > 6 months and no longer actively referenced

## Usage Guidelines

### For Development Team

1. **Before starting work**: Check recent session notes and implementation reports
2. **After completing work**: Create session note or implementation report
3. **Monthly review**: Archive superseded documents, update this index

### For Future Claude Sessions

1. **Session start**: Read this INDEX and recent session notes
2. **Reference**: Use audits and implementation reports for context
3. **Session end**: Create session note with summary and outcomes
4. **Major milestones**: Update relevant reports or create new ones

## Related Documentation

- [Developer Documentation](../docs/README.md) - Public-facing documentation
- [Version Guide](../VERSION_GUIDE.md) - Package versioning information
- [Documentation System](../docs/DOCUMENTATION_SYSTEM.md) - Documentation infrastructure

## Maintenance

**Review Schedule**:
- Weekly: Update INDEX with new documents
- Monthly: Review and archive superseded content
- Quarterly: Comprehensive audit and cleanup

**Last Review**: November 15, 2025  
**Next Review**: December 15, 2025
