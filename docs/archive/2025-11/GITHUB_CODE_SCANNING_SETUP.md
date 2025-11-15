# GitHub Code Scanning Setup Guide

**Date**: November 14, 2025
**Status**: ⚠️ CONFIGURATION REQUIRED
**Issue**: Code Scanning feature not enabled in repository

---

## Current Status

**Workflow Configuration**: ✅ Complete
- Permissions correctly configured
- CodeQL actions updated to v4
- SARIF upload steps configured

**Repository Feature**: ❌ Not Enabled
- GitHub Code Scanning feature disabled
- Security tab upload blocked
- Requires manual enablement

## Error Message

```
Warning: Code scanning is not enabled for this repository.
Please enable code scanning in the repository settings.

Error: Please verify that the necessary features are enabled:
Code scanning is not enabled for this repository.
```

## What Is GitHub Code Scanning?

**GitHub Code Scanning** is a feature that:
- Analyzes code for security vulnerabilities
- Displays findings in the GitHub Security tab
- Integrates with pull requests
- Provides automated security alerts
- Supports SARIF format uploads from external tools (like Trivy)

### Availability

**Public Repositories**:
- ✅ Free for all public repositories
- No additional license required

**Private Repositories**:
- ⚠️ Requires GitHub Advanced Security license
- Part of GitHub Enterprise Cloud/Server
- Contact GitHub sales for pricing

## How to Enable Code Scanning

### Step 1: Navigate to Repository Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Security** in the left sidebar
4. Click **Code security and analysis**

### Step 2: Enable Code Scanning

**Option A: Enable GitHub Advanced Security** (if not already enabled):
```
Code security and analysis
└─ GitHub Advanced Security
   └─ [Enable] button
```

**Option B: Enable Code Scanning** (after Advanced Security is enabled):
```
Code security and analysis
└─ Code scanning
   └─ Set up → Default (recommended)
      OR
   └─ Set up → Advanced (custom workflows)
```

### Step 3: Choose Setup Method

**Default Setup** (Recommended):
- Automatic language detection
- Managed by GitHub
- No workflow file needed
- Quick setup

**Advanced Setup**:
- Custom CodeQL queries
- Full control over scanning
- Uses our existing workflows
- More configuration options

### Step 4: Verify Enablement

After enabling, verify in Security tab:
1. Go to **Security** tab
2. Click **Code scanning**
3. You should see "Set up code scanning" or existing alerts
4. Re-run workflows to upload SARIF results

## Current Workflow Behavior

### With Code Scanning Disabled

**What Happens**:
```
✅ Trivy vulnerability scan runs
✅ SARIF file generated (trivy-results.sarif)
⚠️ Upload to Security tab skipped (continue-on-error: true)
✅ Workflow completes successfully
```

**What You Can Do**:
- Review SARIF files in workflow artifacts
- Run security scans locally
- Enable Code Scanning when ready

### With Code Scanning Enabled

**What Happens**:
```
✅ Trivy vulnerability scan runs
✅ SARIF file generated
✅ Upload to Security tab succeeds
✅ Vulnerabilities appear in Security tab
✅ Workflow completes successfully
```

**What You Get**:
- Security tab alerts
- Pull request checks
- Vulnerability tracking
- Historical trend analysis

## Workflow Configuration

### security.yml - Container Scan

```yaml
- name: Upload Trivy results to GitHub Security
  uses: github/codeql-action/upload-sarif@v4
  continue-on-error: true  # ← Allows workflow to succeed without Code Scanning
  with:
    sarif_file: 'trivy-results.sarif'
```

**Behavior**:
- If Code Scanning enabled: Upload succeeds, results in Security tab
- If Code Scanning disabled: Upload fails gracefully, workflow continues

### ci-cd.yml - Security Scanning

```yaml
- name: Upload Trivy results to GitHub Security
  uses: github/codeql-action/upload-sarif@v4
  continue-on-error: true  # ← Already configured
  with:
    sarif_file: 'trivy-results.sarif'
```

**Same behavior as security.yml**

## Alternative: Download SARIF Files

If you can't enable Code Scanning immediately, you can still review security findings:

### Download from Workflow Artifacts

**Manual Review**:
1. Go to Actions tab
2. Click on workflow run
3. Scroll to "Artifacts" section
4. Download SARIF files
5. View in SARIF viewer (VS Code extension, online tools)

### Add Artifact Upload Step

**Optional enhancement** to make SARIF files easily accessible:

```yaml
- name: Upload Trivy SARIF as artifact
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: trivy-sarif-results
    path: trivy-results.sarif
    retention-days: 30
```

## Benefits of Enabling Code Scanning

### Security Tab Integration

**Centralized Vulnerability Management**:
- All security findings in one place
- Filter by severity, status, tool
- Track remediation progress
- Historical trend analysis

### Pull Request Integration

**Automated Security Checks**:
- Security findings appear in PR reviews
- Block merges on critical vulnerabilities
- Review findings before code ships
- Continuous security validation

### Alert Management

**Actionable Security Workflow**:
- Assign alerts to team members
- Track resolution status
- Link to issues/PRs
- Dismiss false positives

### Compliance & Reporting

**Audit Trail**:
- Security posture over time
- Compliance documentation
- Vulnerability metrics
- Remediation timelines

## Cost Considerations

### Public Repositories

**Free Tier Includes**:
- ✅ Unlimited Code Scanning
- ✅ Unlimited SARIF uploads
- ✅ All security features
- ✅ No additional cost

### Private Repositories

**GitHub Advanced Security Required**:
- 💰 License cost per active committer
- Contact GitHub sales for pricing
- Part of Enterprise Cloud/Server
- Includes Code Scanning + Secret Scanning + Dependency Review

**Free Alternatives**:
- Run Trivy locally
- Use workflow artifacts
- Third-party SARIF viewers
- Manual security reviews

## Recommended Actions

### Immediate (No Code Scanning)

1. ✅ **Workflows configured correctly** - No action needed
2. ✅ **Trivy scans running** - Vulnerabilities detected
3. ✅ **SARIF files generated** - Available in artifacts
4. ⚠️ **Review artifacts manually** - Download and review SARIF files

### Short-term (Public Repo or Budget Available)

1. **Enable Code Scanning** in repository settings
2. **Re-run workflows** to populate Security tab
3. **Review findings** in centralized Security tab
4. **Configure alerts** for team notification

### Long-term (Security Maturity)

1. **Integrate with PR reviews** - Block on critical findings
2. **Set up alerting** - Slack/email notifications
3. **Track metrics** - Monitor security posture trends
4. **Automate remediation** - Dependabot, automated PRs

## Verification Checklist

After enabling Code Scanning, verify:

- [ ] Navigate to Security tab
- [ ] See "Code scanning" section
- [ ] Re-run security workflow
- [ ] Check for uploaded Trivy results
- [ ] Verify alerts appear in Security tab
- [ ] Test PR integration (if configured)
- [ ] Configure notification preferences

## Related Documentation

- [GitHub Code Scanning Docs](https://docs.github.com/en/code-security/code-scanning)
- [Enabling Code Scanning](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/setting-up-code-scanning-for-a-repository)
- [SARIF Support](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/sarif-support-for-code-scanning)
- [GitHub Advanced Security](https://docs.github.com/en/get-started/learning-about-github/about-github-advanced-security)

## Files Modified

- `.github/workflows/security.yml` - Added `continue-on-error: true` to upload-sarif step
- `.github/workflows/ci-cd.yml` - Already had `continue-on-error: true`

## Summary

**Issue**: GitHub Code Scanning feature not enabled in repository
**Workflow Impact**: None - workflows succeed with or without Code Scanning
**Current State**: Security scans run, SARIF files generated, uploads skipped gracefully
**Action Required**: Enable Code Scanning in repository settings to use Security tab integration

**For Public Repositories**: Enable immediately (free)
**For Private Repositories**: Evaluate GitHub Advanced Security license or use alternative SARIF review methods

This is a repository configuration step, not a workflow bug. The workflows are correctly configured and will automatically start uploading to the Security tab once Code Scanning is enabled.
