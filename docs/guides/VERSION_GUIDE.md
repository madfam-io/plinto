# Janua Version Guide

**Last Updated:** November 15, 2025  
**Current Release:** 0.1.0-beta.1 (SDK suite), Mixed versions (internal packages)

## Quick Reference

| Package | Version | Status | Registry |
|---------|---------|--------|----------|
| `@janua/typescript-sdk` | 0.1.0-beta.1 | Beta | npm |
| `@janua/react-sdk` | 0.1.0-beta.1 | Beta | npm |
| `@janua/vue-sdk` | 0.1.0-beta.1 | Beta | npm |
| `@janua/nextjs` | 0.1.0-beta.1 | Beta | npm |
| `janua` (Python SDK) | 0.1.0b1 | Built (not published) | - |
| `janua` (API) | 0.1.0b1 | Development | - |

## Understanding Janua Versions

### SDK Packages (Beta Release)

The **primary SDK packages** are in beta at version `0.1.0-beta.1`:

```bash
# TypeScript/JavaScript
npm install @janua/typescript-sdk@0.1.0-beta.1
npm install @janua/react-sdk@0.1.0-beta.1
npm install @janua/vue-sdk@0.1.0-beta.1
npm install @janua/nextjs@0.1.0-beta.1

```
**Beta Status Means:**
- ✅ Production-ready code quality
- ✅ Comprehensive test coverage
- ✅ Full feature implementation
- ⚠️ APIs may change before 1.0.0
- ⚠️ Use with caution in production
### Internal Packages (Stable)
**Internal utility packages** are at version `1.0.0`:
```
@janua/core          1.0.0  (Internal utilities)
@janua/edge          1.0.0  (Edge runtime adapters)
@janua/jwt-utils     1.0.0  (JWT utilities)
@janua/mock-api      1.0.0  (Testing utilities)
@janua/monitoring    1.0.0  (Monitoring integration)
@janua/react-native  1.0.0  (React Native SDK - in development)
@janua/ui            1.0.0  (UI components library)
```
**Why 1.0.0?**
These packages are internal dependencies used by the SDK suite. They have stable APIs and are considered production-ready for internal use.
### Development Packages (Unreleased)
Some packages exist in the monorepo but are **not yet published**:
- `@janua/config` - Internal configuration management
- `@janua/database` - Database utilities (API-specific)
- `@janua/flutter-sdk` - Flutter/Dart SDK (in development)
- `@janua/go-sdk` - Go SDK (in development)
- `@janua/react-native-sdk` - React Native SDK (in development)
- `janua` (Python SDK) - Python SDK (built, publication pending)
## Version Compatibility Matrix
### SDK Suite Compatibility
| SDK | Version | TypeScript SDK | API Version | Node.js | Python |
|-----|---------|---------------|-------------|---------|--------|
| TypeScript | 0.1.0-beta.1 | - | 0.1.0b1 | ≥16 | - |
| React | 0.1.0-beta.1 | 0.1.0-beta.1 | 0.1.0b1 | ≥16 | - |
| Vue | 0.1.0-beta.1 | 0.1.0-beta.1 | 0.1.0b1 | ≥16 | - |
| Next.js | 0.1.0-beta.1 | 0.1.0-beta.1 | 0.1.0b1 | ≥16 | - |
**Important**: All framework SDKs (React, Vue, Next.js) depend on `@janua/typescript-sdk@0.1.0-beta.1`. Install both packages:
```bash
# React
npm install @janua/react-sdk@0.1.0-beta.1 @janua/typescript-sdk@0.1.0-beta.1
# Vue
npm install @janua/vue-sdk@0.1.0-beta.1 @janua/typescript-sdk@0.1.0-beta.1
# Next.js
npm install @janua/nextjs@0.1.0-beta.1 @janua/typescript-sdk@0.1.0-beta.1
```
### API Compatibility
| API Version | SDK Versions | Breaking Changes | Migration Required |
|-------------|--------------|------------------|-------------------|
| 0.1.0b1 | 0.1.0-beta.1 (all SDKs) | N/A (initial release) | N/A |
## Installation Examples
### TypeScript/JavaScript Projects
```bash
# Core TypeScript SDK
npm install @janua/typescript-sdk@0.1.0-beta.1
# React Applications
npm install @janua/react-sdk@0.1.0-beta.1 @janua/typescript-sdk@0.1.0-beta.1
# Vue Applications  
npm install @janua/vue-sdk@0.1.0-beta.1 @janua/typescript-sdk@0.1.0-beta.1
# Next.js Applications
npm install @janua/nextjs@0.1.0-beta.1 @janua/typescript-sdk@0.1.0-beta.1
```

## Version Pinning Recommendations

### Development

Use exact versions during beta:

```json
{
  "dependencies": {
    "@janua/react-sdk": "0.1.0-beta.1",
    "@janua/typescript-sdk": "0.1.0-beta.1"
  }
}
```

```python
# requirements.txt

```

### Production

**Beta releases**: Pin to exact versions to avoid breaking changes:

```json
{
  "dependencies": {
    "@janua/react-sdk": "0.1.0-beta.1"
  }
}
```

**After 1.0.0 release**: Use caret ranges for patch updates:

```json
{
  "dependencies": {
    "@janua/react-sdk": "^1.0.0"
  }
}
```

## Upgrade Paths

### Beta to 1.0.0 (Future)

When Janua releases 1.0.0:

1. **Review breaking changes** in CHANGELOG.md
2. **Update package.json** to 1.0.0 versions
3. **Test thoroughly** - API changes expected
4. **Follow migration guide** (will be provided)

### Between Beta Versions (Future)

When new beta versions are released (e.g., 0.1.0-beta.2):

1. **Check release notes** for changes
2. **Update package.json** explicitly
3. **Run tests** before deploying
4. **Monitor for deprecation warnings**

## Semantic Versioning

Janua follows [Semantic Versioning 2.0.0](https://semver.org/):

**Version Format**: `MAJOR.MINOR.PATCH[-PRERELEASE]`

- **MAJOR** (0): Breaking API changes
- **MINOR** (1): New features, backward compatible
- **PATCH** (0): Bug fixes, backward compatible
- **PRERELEASE** (beta.1): Pre-release identifier

**Beta versions**: APIs may change. Use exact version pinning.

**After 1.0.0**: Breaking changes increment MAJOR version.

## Python Version Notes

Python uses PEP 440 versioning:

```
npm version:    0.1.0-beta.1
Python version: 0.1.0b1
```

Both represent the same release, formatted per ecosystem standards.

## Checking Your Installed Version

### npm/yarn/pnpm

```bash
npm list @janua/typescript-sdk
# @janua/typescript-sdk@0.1.0-beta.1

npm list @janua/react-sdk  
# @janua/react-sdk@0.1.0-beta.1
```


### In Code

```typescript
// TypeScript/JavaScript
import { version } from '@janua/typescript-sdk';
console.log(version); // 0.1.0-beta.1
```
## Support & Resources
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)
- **Migration Guides**: [docs/migration/](../docs/migration/)
- **Breaking Changes**: Documented in release notes
- **Version Support**: Only latest beta version supported
## FAQ
**Q: Why are some packages at 1.0.0 and others at 0.1.0-beta.1?**  
A: The 1.0.0 packages are internal utilities with stable APIs. The 0.1.0-beta.1 packages are public-facing SDKs still in beta.
**Q: Can I use beta packages in production?**  
A: Yes, but with caution. Pin to exact versions and monitor for updates. Code quality is production-ready, but APIs may change.
**Q: When will 1.0.0 be released?**  
A: After beta testing phase completes and APIs are stabilized. Timeline TBD.
**Q: Do I need to install TypeScript SDK separately?**  
A: Yes, for React/Vue/Next.js SDKs. They depend on the core TypeScript SDK.
**Q: What's the difference between @janua/core and @janua/typescript-sdk?**  
A: `@janua/core` is an internal utility package (1.0.0). `@janua/typescript-sdk` is the public SDK (0.1.0-beta.1).
---
*For detailed API documentation, see [docs/api/](../docs/api/)*  
*For SDK guides, see [docs/sdks/](../docs/sdks/)*
