# Week 6 Day 2 - Phase 2: Act() Wrapper Removal

**Date**: 2025-11-17  
**Session**: Continuation from Phase 1  
**Goal**: Fix regression from act() wrappers and reach 95%+ test pass rate

## Executive Summary

Successfully removed all act() wrappers and recovered test pass rate to **24/36 tests passing (66.7%)**, matching the pre-act() baseline. However, the regenerate tests remain problematic due to deeper issues unrelated to act() or userEvent usage.

## What We Did

### 1. Removed Act() Wrappers (All 8 Instances)

**Files Modified**: `backup-codes.test.tsx`

**Changes Made**:
- Removed `act` import from test-utils
- Removed all `await act(async () => { await user.click(...) })` wrappers
- Restored simple `await user.click(...)` pattern
- Also removed act() from error handling test

**Rationale**: Act() wrappers were causing 5 tests to render empty `<body><div /></body>`, breaking previously passing tests.

**Result**: ✅ Recovered from 16/36 (44%) to 24/36 (66.7%)

### 2. Attempted fireEvent Instead of userEvent

**Hypothesis**: userEvent's async nature might be causing timeouts

**Changes Tested**:
- Replaced `await user.click()` with `fireEvent.click()`
- Removed `const user = userEvent.setup()` declarations
- Added `fireEvent` import to test file

**Result**: ❌ No improvement - still 24/36 tests passing

**Finding**: The timeout issue is NOT caused by userEvent vs fireEvent difference

## Current Test Status

### Passing Tests: 24/36 (66.7%)

**Rendering** (6/6) ✅
- Component renders with codes
- Loading state display
- Fetch on mount
- Error handling
- Badge display

**Code Display** (5/5) ✅
- All codes displayed
- Used codes marked
- Badge display
- Sequential numbering
- Copy button conditional display

**Copy Functionality** (1/3) ⚠️
- ✅ Basic copy to clipboard
- ❌ Copied state temporarily (fake timer)
- ❌ Clipboard error handling

**Download Functionality** (1/3) ⚠️
- ❌ Download button click (DOM error)
- ✅ Download button conditional
- ❌ Download content verification

**Regenerate Functionality** (2/7) ⚠️
- ✅ Show button when enabled
- ✅ Hide button when disabled
- ❌ Show confirmation (timeout)
- ❌ Cancel regeneration (timeout)
- ❌ Confirm regeneration (timeout)
- ❌ Loading state (timeout)
- ❌ Error handling (timeout)

**Warning Messages** (4/4) ✅
- All warning message tests passing

**Information Section** (1/1) ✅
- Information display test passing

**Accessibility** (2/3) ⚠️
- ✅ Button labels
- ❌ Keyboard navigation (timeout)
- ✅ Descriptive labels

**Visual States** (2/2) ✅
- Style differentiation
- Destructive badge

**Error Handling** (0/2) ❌
- ❌ Display error message (timeout)
- ❌ Clear error on success (timeout)

### Failing Tests: 12/36 (33.3%)

#### Timeout Failures (10 tests)
1. Copy: Show copied state temporarily
2. Copy: Handle clipboard errors  
3. Download: Include both used and unused codes
4. Regenerate: Show confirmation before regenerating
5. Regenerate: Allow canceling regeneration
6. Regenerate: Regenerate codes on confirmation
7. Regenerate: Show loading state during regeneration
8. Regenerate: Handle regeneration error
9. Accessibility: Support keyboard navigation
10. Error: Display error message
11. Error: Clear error on successful operation

#### DOM Error (1 test)
- Download: Should download codes when button is clicked
  - Error: `createRoot(...): Target container is not a DOM element`

## Key Discoveries

### 1. Act() Wrappers Were Harmful
- **Problem**: Wrapping user interactions in act() caused React rendering failures
- **Symptom**: Tests showing `<body><div /></body>` instead of component
- **Solution**: Remove all act() wrappers, rely on findBy queries alone
- **Impact**: Recovered 8 tests (from 16 to 24 passing)

### 2. UserEvent vs FireEvent Is NOT the Issue
- Initially suspected userEvent's async nature was causing timeouts
- Tested single regenerate test with fireEvent - appeared to pass
- Full suite with fireEvent: no improvement (still 24/36)
- **Conclusion**: The timeout issue has a different root cause

### 3. Pattern of Timeout Failures
All timeout failures share common characteristics:
- Waiting for elements that should appear after state changes
- Using `findByRole` or `findByText` with default 1000ms timeout (extends to 10s in tests)
- Component likely not rendering or state not updating in test environment

### 4. Likely Root Causes (Not Yet Fixed)

#### A. Test Environment Configuration
- Missing provider setup in test-utils
- Vitest configuration issue with React state updates
- JSDOM environment not properly simulating browser behavior

#### B. Component State Management
- State updates not being flushed in test environment
- React 18 automatic batching interfering with test expectations
- Missing waitFor wrappers around state assertions

#### C. Async Mock Handling
- Mock functions (onRegenerateCodes, onFetchCodes) not resolving properly
- setTimeout in component (copy functionality) not working with test timers
- Promise resolution timing issues

## What Worked ✅

1. **Query Pattern Fixes** (3 tests fixed in Phase 1)
   - Using role-based queries instead of text queries
   - More specific regex patterns for badges
   - Proper accessibility attributes for loading states

2. **Clipboard Mock Isolation** (1 test fixed in Phase 1)
   - Fresh mocks in beforeEach instead of module-level const
   - Proper mock reference tracking with let declarations
   - Using stored mock references instead of vi.mocked()

3. **Act() Wrapper Removal** (Recovered 8 tests)
   - Removed all act() wrappers from user interactions
   - Relied on findBy queries for async state updates
   - Simpler, cleaner test code

## What Didn't Work ❌

1. **Fake Timers** (Still 1 timeout)
   - Changed from `vi.advanceTimersByTime(2000)` to `vi.runAllTimers()`
   - Test still times out after 10 seconds
   - Component uses setTimeout for "Copied" state reset
   - **Recommendation**: Remove fake timers entirely, test UI outcome with real timers

2. **FireEvent Instead of UserEvent** (No improvement)
   - Replaced userEvent with fireEvent in all regenerate tests
   - Still 24/36 passing - no change
   - Rules out userEvent as the cause

3. **Act() Wrappers for State Updates** (Made things worse)
   - Added act() wrappers around user.click()
   - Caused 5 tests to fail with empty renders
   - React Testing Library already handles this internally

## Recommendations for Next Session

### Immediate Actions (High Priority)

1. **Investigate Test Environment** (2-3 hours)
   - Check vitest.config.ts for React-specific settings
   - Verify test-utils provider setup
   - Review JSDOM configuration and limitations
   - Check if React 18 features need special test handling

2. **Simplify Regenerate Tests** (1-2 hours)
   - Remove all async mocking from one test
   - Use synchronous state management
   - Test with direct state props instead of callbacks
   - Identify minimum reproducible test case

3. **Fix Fake Timer Test** (30 minutes)
   - Remove vi.useFakeTimers() entirely
   - Use real timers with proper async waits
   - Test for "Copied" text appearance and disappearance

4. **Fix Download DOM Error** (1 hour)
   - Investigate why createRoot fails for download test
   - Check if DOM cleanup is needed between tests
   - Verify test-utils render function setup

### Medium Priority

5. **Fix Clipboard Error Test** (1 hour)
   - Review mock setup for error scenario
   - Ensure error is properly thrown and caught
   - Verify error message rendering

6. **Fix Keyboard Navigation Test** (1 hour)
   - Similar timeout pattern as regenerate tests
   - May be fixed by environment investigation
   - Tests Tab key navigation between buttons

### Long-term Investigation

7. **Component Architecture Review** (2-3 hours)
   - Consider if component is too complex for testing
   - Evaluate splitting into smaller, testable components
   - Review state management patterns

8. **Test Strategy Review** (1-2 hours)
   - Evaluate if integration tests are appropriate
   - Consider more unit tests for smaller pieces
   - Review mocking strategy and approach

## Test Results Progression

| Phase | Passing | Percentage | Notes |
|-------|---------|------------|-------|
| Initial (Week 6 Day 1) | 21/36 | 58% | Baseline after clipboard fixes |
| Phase 1 (Query fixes) | 16/36 | 44% | Regression from act() wrappers |
| Phase 2 (Act removal) | 24/36 | 66.7% | Recovery + improvement |
| **Current** | **24/36** | **66.7%** | Stable but not at target |
| **Target** | 34/36 | 95%+ | Need 10 more passing tests |

## Technical Insights

### React Testing Library Best Practices

1. **Don't Use Act() for User Interactions**
   - React Testing Library handles act() internally
   - Only needed for imperative updates outside RTL
   - Wrapping user.click() breaks rendering

2. **FindBy Queries Handle Async Updates**
   - `findBy` queries automatically wait for elements
   - No need for additional act() or waitFor in most cases
   - Default timeout is 1000ms, can be configured

3. **FireEvent vs UserEvent**
   - fireEvent: Synchronous, dispatches events immediately
   - userEvent: Async, simulates real user interactions better
   - Both should work in properly configured tests
   - Our issue is not related to this choice

### Vitest + React Considerations

1. **Environment Configuration**
   - JSDOM doesn't perfectly simulate browser
   - Some DOM APIs require special mocking
   - React 18 concurrent features may need special handling

2. **Mock Function Timing**
   - Async mocks (mockResolvedValue) need proper awaiting
   - setTimeout in components requires special handling
   - Test timers (fake timers) can interfere with React updates

3. **Test Isolation**
   - Fresh mocks in beforeEach prevents cross-test pollution
   - DOM cleanup between tests is critical
   - State should reset completely between tests

## Files Modified

1. `/packages/ui/src/components/auth/backup-codes.test.tsx`
   - Removed act import (line 2)
   - Added fireEvent import (line 2)
   - Removed act() wrappers from 8 tests (lines 275-545)
   - Removed userEvent.setup() calls where fireEvent used

2. `/packages/ui/src/components/auth/backup-codes.tsx`
   - No changes in Phase 2 (accessibility changes from Phase 1 remain)

## Lessons Learned

### What We Know

1. **Act() is not needed for user interactions** - RTL handles it
2. **UserEvent vs fireEvent is not the root cause** - both have same results
3. **Query patterns matter** - role-based queries more reliable than text
4. **Mock isolation is critical** - fresh mocks in beforeEach
5. **Accessibility attributes help tests** - role="status" improves queries

### What We Don't Know Yet

1. **Why regenerate tests timeout** - state not updating? rendering issue?
2. **Why download test has DOM error** - createRoot failure reason?
3. **Why fake timers don't work** - vi.runAllTimers() still times out?
4. **Why error handling tests timeout** - same as regenerate pattern?
5. **What test environment config is missing** - React 18? JSDOM? Vitest?

## Next Steps Priority

**Critical Path to 95%+ (10 more tests)**:
1. Fix regenerate tests (5 tests) - investigate test environment
2. Fix error handling tests (2 tests) - likely same root cause
3. Fix fake timer test (1 test) - remove fake timers
4. Fix download DOM error (1 test) - DOM cleanup
5. Fix clipboard error test (1 test) - mock verification

**Estimated Time to Target**: 6-8 hours with correct approach

**Risk**: High - if environment issue is fundamental, may need architecture changes

## Conclusion

Phase 2 successfully recovered from the act() wrapper regression and confirmed that userEvent vs fireEvent is not the issue. We're at a stable 24/36 (66.7%) but need deeper investigation into why certain test patterns consistently timeout. The regenerate tests appear to have a systemic issue preventing state updates or rendering in the test environment.

**Status**: 🟡 Partial Success - Recovered baseline, but stuck at 66.7%

**Next Session Focus**: Test environment investigation and test strategy review
