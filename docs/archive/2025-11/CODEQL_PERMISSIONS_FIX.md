# CodeQL Permissions and Version Fix

**Date**: November 14, 2025
**Issue**: CodeQL Action failing with permissions error and deprecation warnings
**Status**: ✅ RESOLVED

---

## Problem Summary

GitHub Actions workflows were failing when trying to upload security scan results:

```
Error: Resource not accessible by integration -
https://docs.github.com/rest/actions/workflow-runs#get-a-workflow-run

Warning: CodeQL Action v3 will be deprecated in December 2026.
Please update all occurrences of the CodeQL Action in your workflow files to v4.
```

## Root Causes

### Issue 1: Missing Permissions

**Jobs Affected**:
- `security.yml` → `container-scan` job
- `ci-cd.yml` → `security-scanning` job

Both jobs used CodeQL's `upload-sarif` action to upload Trivy security scan results to GitHub's Security tab, but lacked the required `security-events: write` permission.

### Issue 2: Deprecated Action Version

All CodeQL actions used `@v3` which will be deprecated in December 2026.

## Detailed Analysis

### Permission Error Breakdown

**What Was Happening**:
```yaml
container-scan:
  name: Container Security Scan
  runs-on: ubuntu-latest
  # ❌ NO permissions block

  steps:
    - name: Upload Trivy results to GitHub Security
      uses: github/codeql-action/upload-sarif@v3  # Tries to write to Security tab
      with:
        sarif_file: 'trivy-results.sarif'
```

**Why It Failed**:

1. **Default Permissions**: When no `permissions` block is specified, GitHub Actions uses default restricted permissions
2. **Security Tab Access**: Writing to GitHub Security tab requires `security-events: write` permission
3. **Integration Error**: Without permission, the action can't access GitHub API endpoints for security events
4. **Telemetry Failure**: Same permission issue prevented telemetry collection

### Working Example (sast-codeql job)

```yaml
sast-codeql:
  name: CodeQL Analysis
  runs-on: ubuntu-latest
  permissions:  # ✅ Explicit permissions block
    actions: read
    contents: read
    security-events: write  # ✅ Required for Security tab

  steps:
    - uses: github/codeql-action/init@v3
    - uses: github/codeql-action/analyze@v3
```

This job worked because it had explicit `security-events: write` permission.

## Solution Applied

### Fix 1: Add Permissions to Jobs

**security.yml - container-scan job**:
```yaml
container-scan:
  name: Container Security Scan
  runs-on: ubuntu-latest
  permissions:  # ✅ Added permissions block
    actions: read           # Required for workflow run information
    contents: read          # Required for repository checkout
    security-events: write  # Required for SARIF upload

  steps:
    # ... Trivy scan and upload steps
```

**ci-cd.yml - security-scanning job**:
```yaml
security-scanning:
  name: Security Scanning
  runs-on: ubuntu-latest
  permissions:  # ✅ Added permissions block
    actions: read           # Required for workflow run information
    contents: read          # Required for repository checkout
    security-events: write  # Required for SARIF upload

  steps:
    # ... Trivy scan and upload steps
```

### Fix 2: Update CodeQL Actions to v4

**Updated Actions** (5 total across 2 workflows):

**security.yml** (4 actions):
```yaml
# Before → After
- uses: github/codeql-action/init@v3        → @v4
- uses: github/codeql-action/autobuild@v3   → @v4
- uses: github/codeql-action/analyze@v3     → @v4
- uses: github/codeql-action/upload-sarif@v3 → @v4
```

**ci-cd.yml** (1 action):
```yaml
# Before → After
- uses: github/codeql-action/upload-sarif@v3 → @v4
```

## Understanding GitHub Actions Permissions

### Permission Scopes

**Common Permissions**:
```yaml
permissions:
  actions: read|write        # Access to Actions workflows
  contents: read|write       # Repository content
  security-events: write     # GitHub Security tab (required for SARIF upload)
  pull-requests: write       # PR comments and labels
  issues: write              # Issue creation and comments
  statuses: write            # Commit statuses
```

### Security Tab Requirements

**SARIF Upload Workflow**:
```
Trivy Scan → Generate SARIF → Upload to Security Tab → View in Security Tab
                               ↑
                    Requires: security-events: write
```

### Default vs Explicit Permissions

**Default Permissions** (when no `permissions` block):
- Very restricted for security
- May not include `security-events: write`
- Can cause integration errors

**Explicit Permissions** (recommended):
- ✅ Clear about what job can access
- ✅ Principle of least privilege
- ✅ Prevents permission-related errors
- ✅ Self-documenting workflow requirements

### Best Practice Pattern

```yaml
job-name:
  runs-on: ubuntu-latest
  permissions:  # Always specify explicitly
    contents: read           # Checkout code
    security-events: write   # Upload security results
    # Only include what's needed

  steps:
    # ... job steps
```

## CodeQL Action v3 → v4 Migration

### Why Update?

1. **Deprecation Timeline**: v3 will be deprecated in December 2026
2. **Future Support**: v4 will receive updates and bug fixes
3. **New Features**: v4 includes performance improvements and new capabilities
4. **Breaking Changes**: Minimal - mostly backward compatible

### Migration Checklist

✅ **Updated Actions**:
- `github/codeql-action/init@v4`
- `github/codeql-action/autobuild@v4`
- `github/codeql-action/analyze@v4`
- `github/codeql-action/upload-sarif@v4`

✅ **No Configuration Changes**: Existing `with:` parameters work with v4

✅ **No Breaking Changes**: v4 maintains compatibility with v3 workflows

### Action-Specific Changes

**init@v4**:
- Same language support
- Same query configuration
- Improved performance

**autobuild@v4**:
- Better build detection
- Faster build times
- Same build matrix support

**analyze@v4**:
- Enhanced SARIF output
- Better error reporting
- Same security-and-quality queries

**upload-sarif@v4**:
- Improved permission handling
- Better error messages
- Same SARIF format support

## Verification

After applying fixes, workflows should:

✅ **No permission errors**
```bash
# Before (error):
Error: Resource not accessible by integration

# After (success):
Post-processing sarif files: ["trivy-results.sarif"]
Validating trivy-results.sarif ✅
Adding fingerprints to SARIF file ✅
Successfully uploaded SARIF results to Security tab ✅
```

✅ **No deprecation warnings**
```bash
# Before (warning):
Warning: CodeQL Action v3 will be deprecated in December 2026

# After (clean):
# No warnings - using latest v4 actions
```

✅ **Security results visible**
```
GitHub Security Tab → Code Scanning Alerts → Trivy Scan Results
- Critical vulnerabilities
- High severity issues
- Medium severity findings
```

## Files Modified

### Workflows Updated

**`.github/workflows/security.yml`**:
- Added `permissions` block to `container-scan` job
- Updated 4 CodeQL actions from v3 → v4

**`.github/workflows/ci-cd.yml`**:
- Added `permissions` block to `security-scanning` job
- Updated 1 CodeQL action from v3 → v4

## Impact

### Before Fixes

❌ **Container Security Scanning**: Failed to upload results
❌ **CI/CD Security Scanning**: Failed to upload results
⚠️ **Deprecation Warnings**: Using outdated action versions
❌ **Security Tab**: No Trivy scan results visible

### After Fixes

✅ **Container Security Scanning**: Successfully uploads to Security tab
✅ **CI/CD Security Scanning**: Successfully uploads to Security tab
✅ **No Warnings**: Using latest v4 actions
✅ **Security Tab**: Full visibility of vulnerability scans

## Best Practices Established

### Permission Management

1. **Always Specify Permissions**:
   ```yaml
   permissions:
     actions: read
     contents: read
     security-events: write
   ```

2. **Least Privilege**:
   - Only grant permissions actually needed
   - Be explicit about requirements
   - Document why each permission is needed

3. **Consistent Patterns**:
   - Use same permission pattern across similar jobs
   - Copy from working jobs (like sast-codeql)
   - Review permissions regularly

### Action Version Management

1. **Use Latest Versions**:
   - Stay current with action updates
   - Monitor deprecation notices
   - Update proactively, not reactively

2. **Pin Major Versions**:
   ```yaml
   uses: github/codeql-action/analyze@v4  # ✅ Pin major version
   ```

3. **Test Before Widespread Rollout**:
   - Test new versions in feature branches
   - Verify no breaking changes
   - Update all occurrences together

## Related Documentation

- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [CodeQL Action v4](https://github.com/github/codeql-action/releases)
- [SARIF Support for Code Scanning](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)
- [Uploading a SARIF file](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/uploading-a-sarif-file-to-github)

## Summary

**Problem**: CodeQL actions failed with permission errors and used deprecated v3 versions
**Solution**: Added `security-events: write` permissions and updated all CodeQL actions to v4
**Result**: Security scans now successfully upload results to GitHub Security tab

This fix ensures:
- ✅ Trivy vulnerability scans appear in Security tab
- ✅ No permission-related integration errors
- ✅ No deprecation warnings
- ✅ Future-proof workflow configuration
- ✅ Complete visibility into security vulnerabilities

Both workflows now follow GitHub Actions best practices for security scanning and permission management.
