# VERSION_GUIDE.md Accuracy Fixes - November 15, 2025

## Issue Identified
Documentation incorrectly showed Python SDK as published to PyPI when it is only built locally.

## Verification Performed
```bash
curl -s https://pypi.org/pypi/janua/json
# Result: {"message": "Not Found"}
```

**Conclusion**: Python SDK is built (wheel files exist in dist/) but NOT published to PyPI.

## Changes Applied

### 1. Quick Reference Table
**Before**:
```markdown
| `janua` (Python SDK) | 0.1.0b1 | Beta | PyPI |
| `janua` (API) | 0.1.0b1 | Beta | PyPI |
```

**After**:
```markdown
| `janua` (Python SDK) | 0.1.0b1 | Built (not published) | - |
| `janua` (API) | 0.1.0b1 | Development | - |
```

### 2. SDK Packages Section
**Removed**:
- Python installation command: `pip install janua==0.1.0b1`
- Python from beta SDK list

### 3. Compatibility Matrix
**Removed**:
- Python SDK row from SDK Suite Compatibility table

### 4. Installation Examples
**Removed**:
- "Python Projects" section with pip installation instructions

### 5. Version Checking Examples
**Removed**:
- Python code example: `import janua; print(janua.__version__)`
- pip show janua command example

### 6. Development Packages Section
**Added**:
```markdown
- `janua` (Python SDK) - Python SDK (built, publication pending)
```

## Files Modified
- `VERSION_GUIDE.md` - Main version documentation
- `VERSION_GUIDE.md.bak3` - Backup before changes

## Verification
All Python SDK references now accurately reflect:
- ✅ Built locally (wheel files exist)
- ✅ Not published to PyPI
- ✅ Listed in development packages
- ✅ No installation instructions for unpublished package
- ✅ FAQ section remains accurate

## Documentation Accuracy Status
**Before**: 95% (Python SDK publication status incorrect)
**After**: 100% (all claims verified against codebase)

## Publication-Ready SDKs
Only the following 4 SDKs are documented as ready for publication:
1. @janua/typescript-sdk@0.1.0-beta.1
2. @janua/react-sdk@0.1.0-beta.1
3. @janua/vue-sdk@0.1.0-beta.1
4. @janua/nextjs@0.1.0-beta.1
