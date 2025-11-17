# Test Stability Action Plan - Week 6 Day 2

**Created**: 2025-11-17  
**Status**: Active Roadmap  
**Target**: Achieve 95%+ test pass rate for production readiness

---

## Current State Summary

### Achievements This Session ✅
- Enhanced test cleanup infrastructure
- Fixed Navigator.clipboard errors (54 tests unblocked)
- Implemented UI-feedback testing pattern
- backup-codes.test.tsx: 8/36 → 21/36 (+13 tests)

### Remaining Issues 🔧
- **Timeouts**: 15+ tests failing at 10s timeout
- **Query issues**: ~3 tests with multiple element matches
- **sign-in.test.tsx**: 13 failures (43% pass rate)
- **Unknown failures**: Various scattered issues

### Estimated Pass Rate
- **Before session**: ~65% (317/489)
- **After session**: ~68-70% (estimated, pending full verification)
- **Target**: 95% (465/489)
- **Gap**: ~95-98 tests to fix

---

## Priority 1: Timeout Issues (Next Session)

### Identified Timeout Patterns

**Category A: User Interaction Timeouts**
- Keyboard navigation tests
- Multi-step user flows
- Async state updates

**Category B: Component Lifecycle Timeouts**
- Regenerate functionality
- Download operations
- Error handling flows

**Category C: Timer-Related Timeouts**
- Tests using `vi.useFakeTimers()`
- Async operations with delays
- State transitions with setTimeout

### Investigation Strategy

1. **Run Single Timeout Test in Isolation**
   ```bash
   npm test -- src/components/auth/backup-codes.test.tsx \
     -t "should support keyboard navigation" --run --reporter=verbose
   ```

2. **Add Debug Logging**
   ```typescript
   it('should support keyboard navigation', async () => {
     console.log('1. Setup')
     const user = userEvent.setup()
     
     console.log('2. Render')
     render(<Component />)
     
     console.log('3. Tab')
     await user.tab()
     
     console.log('4. Check focus')
     expect(element).toHaveFocus()
   })
   ```

3. **Check for Missing Awaits**
   - Ensure all async operations are awaited
   - Use `waitFor()` for state-dependent assertions
   - Add `findBy` queries instead of `getBy` for async elements

4. **Verify Cleanup**
   - Check if timers are properly cleared
   - Ensure event listeners are removed
   - Confirm mocks are restored

### Quick Fixes to Try

**Fix A: Increase Timeout for Complex Tests**
```typescript
it('complex test', async () => {
  // Test code
}, 15000) // 15 second timeout instead of default 10s
```

**Fix B: Add Explicit Waits**
```typescript
// Before
await user.click(button)
expect(screen.getByText(/success/i)).toBeInTheDocument()

// After
await user.click(button)
expect(await screen.findByText(/success/i)).toBeInTheDocument()
```

**Fix C: Check Timer Cleanup**
```typescript
afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers() // Reset if using fake timers
})
```

### Success Criteria
- [ ] Identify root cause of timeout pattern
- [ ] Fix at least 10 timeout failures
- [ ] Document solution for future tests
- [ ] Timeout rate < 5% of total tests

---

## Priority 2: Query Issues (Quick Wins)

### Common Pattern
```
Error: Found multiple elements with the text: /backup codes/i
```

### Solution Pattern
```typescript
// ❌ Fails with multiple matches
expect(screen.getByText(/backup codes/i)).toBeInTheDocument()

// ✅ Use more specific query
expect(screen.getByRole('heading', { name: /backup codes/i })).toBeInTheDocument()

// ✅ Or get first match explicitly
expect(screen.getAllByText(/backup codes/i)[0]).toBeInTheDocument()
```

### Quick Fix Script
```bash
# Find all tests with this pattern
grep -r "getByText" src/components/auth/*.test.tsx | \
  grep -v "getAllByText"
```

### Files to Fix
1. backup-codes.test.tsx - "backup codes" text
2. password-reset.test.tsx - likely similar issues
3. Any test with generic text queries

### Success Criteria
- [ ] Fix all "multiple elements" errors
- [ ] Update test writing guidelines
- [ ] ~3 tests fixed

---

## Priority 3: sign-in.test.tsx Failures

### Current Status
- **Pass rate**: 10/23 (43%)
- **Failures**: 13 tests
- **Impact**: High (critical authentication flow)

### Known Issues

**Issue 1: Form Validation Not Appearing**
```typescript
// Failing test pattern
await user.click(submitButton)
expect(screen.getByText(/email is required/i)).toBeInTheDocument()
// Error: Unable to find element
```

**Root Cause**: Validation is async, needs `findBy` or `waitFor`

**Fix**:
```typescript
await user.click(submitButton)
expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
```

**Issue 2: Social Login Handler Not Called**
```typescript
// Failing test
await user.click(googleButton)
expect(mockSocialLogin).toHaveBeenCalled()
// Error: expected "spy" to be called, received 0 calls
```

**Root Cause**: Navigation mock or handler setup issue

**Investigation Steps**:
1. Check if social login buttons are rendered correctly
2. Verify handler props are passed to component
3. Check for navigation mocking conflicts

**Issue 3: Error States Not Captured**
Similar to validation issue - needs async handling

### Action Items
- [ ] Read sign-in.test.tsx completely
- [ ] Categorize 13 failures by type
- [ ] Fix validation issues with findBy/waitFor
- [ ] Debug social login handler setup
- [ ] Run tests incrementally after each fix

### Success Criteria
- [ ] sign-in.test.tsx: 10/23 → 20/23 (87%)
- [ ] All critical auth flows passing
- [ ] Pattern documented for other tests

---

## Priority 4: Full Test Suite Analysis

### Batch Testing Strategy

**Phase 1: High-Performing Files** (Expected: >90% pass)
```bash
npm test -- src/components/auth/{user-button,user-profile,organization-*}.test.tsx --run
```

**Phase 2: Medium-Performing Files** (Expected: 70-90%)
```bash
npm test -- src/components/auth/{phone-verification,email-verification,session-management}.test.tsx --run
```

**Phase 3: Problem Files** (Expected: <70%)
```bash
npm test -- src/components/auth/{sign-in,mfa-setup,backup-codes,password-reset}.test.tsx --run
```

### Metrics to Collect
- Individual file pass rates
- Total pass rate
- Failure categories (timeout, query, async, mock)
- Test execution time
- Patterns in failures

### Analysis Questions
1. Do high-performing files share common patterns?
2. Are failures concentrated in specific test types?
3. Is there correlation between file size and pass rate?
4. Are newer files better tested than older ones?

### Success Criteria
- [ ] Complete test run without hangs
- [ ] Detailed metrics collected
- [ ] Pass rate improvement measured
- [ ] Remaining issues categorized

---

## Priority 5: Test Quality Improvements

### Pattern Migration

**Old Pattern → New Pattern**

1. **API Mocking → UI Feedback**
```typescript
// Old: Mock and spy on API
const spy = vi.spyOn(navigator.clipboard, 'writeText')
expect(spy).toHaveBeenCalled()

// New: Test user-visible outcome
await user.click(copyButton)
expect(await screen.findByText(/copied/i)).toBeInTheDocument()
```

2. **getBy → findBy for Async**
```typescript
// Old: Synchronous query (fails for async)
await user.click(button)
expect(screen.getByText(/success/i)).toBeInTheDocument()

// New: Async query
await user.click(button)
expect(await screen.findByText(/success/i)).toBeInTheDocument()
```

3. **Generic Queries → Specific Queries**
```typescript
// Old: Ambiguous
expect(screen.getByText(/submit/i)).toBeInTheDocument()

// New: Role-based
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
```

### Testing Guidelines Document

**Create**: `/docs/testing/testing-best-practices.md`

**Contents**:
- ✅ Clipboard testing pattern (completed)
- 🔄 Async operation testing
- 🔄 User interaction patterns
- 🔄 Mock setup and cleanup
- 🔄 Common pitfalls and solutions

### Code Review Checklist

**For New Tests**:
- [ ] Uses `findBy` for async assertions
- [ ] Uses specific queries (role-based when possible)
- [ ] Tests UI feedback not API calls
- [ ] Includes proper cleanup
- [ ] Avoids fake timers unless necessary
- [ ] Has meaningful test descriptions

### Success Criteria
- [ ] Testing guidelines documented
- [ ] 5+ tests migrated to new patterns
- [ ] Team reviewed and approved patterns

---

## Timeline & Milestones

### Session 3: Timeout Investigation (2-3 hours)
**Goal**: Understand and fix timeout pattern  
**Target**: +10-15 tests passing  
**Deliverable**: Timeout resolution guide

### Session 4: sign-in + Query Fixes (2-3 hours)
**Goal**: Fix sign-in tests and query issues  
**Target**: +15-20 tests passing  
**Deliverable**: 85% pass rate achieved

### Session 5: Polish & Verification (1-2 hours)
**Goal**: Fix remaining scattered failures  
**Target**: +15-20 tests passing  
**Deliverable**: 95% pass rate achieved

### Session 6: Documentation & Handoff (1 hour)
**Goal**: Complete documentation and guidelines  
**Deliverable**: Production-ready test suite

**Total Estimated Effort**: 8-11 hours across 4 sessions

---

## Success Metrics

### Test Health Indicators

**Target Metrics**:
- ✅ Pass Rate: 95%+ (465/489 tests)
- ✅ Timeout Rate: <5% (<25 tests)
- ✅ Execution Time: <5 minutes for full suite
- ✅ No test hangs or crashes
- ✅ Consistent results across runs

**Quality Indicators**:
- ✅ All critical flows tested (auth, MFA, password reset)
- ✅ High-value tests passing (user-facing features)
- ✅ Test documentation complete
- ✅ Team can maintain tests independently

### Production Readiness Checklist

- [ ] 95%+ test pass rate achieved
- [ ] No critical path failures
- [ ] Test execution stable and fast
- [ ] Documentation complete
- [ ] Team trained on patterns
- [ ] CI/CD integration verified
- [ ] Regression suite identified
- [ ] Performance benchmarks established

---

## Risk Mitigation

### Known Risks

**Risk 1: Timeout Issues More Complex Than Expected**
- **Mitigation**: Allocate 2 sessions instead of 1
- **Fallback**: Increase timeout threshold temporarily
- **Impact**: Delays timeline by 1 session

**Risk 2: New Issues Discovered**
- **Mitigation**: Leave buffer time in timeline
- **Fallback**: Prioritize critical paths only
- **Impact**: May not reach 95% in planned sessions

**Risk 3: Test Performance Degradation**
- **Mitigation**: Profile and optimize hot paths
- **Fallback**: Split tests into smaller batches
- **Impact**: Longer CI/CD times

### Contingency Plans

**If Pass Rate Plateaus at 85-90%**:
1. Identify failing tests by business impact
2. Fix only critical-path tests first
3. Document known issues for remaining 5-10%
4. Ship with 90% pass rate, continue improvement

**If Timeout Issues Are Systemic**:
1. Consider alternative test runner (happy-dom vs jsdom)
2. Evaluate component complexity (simplify if possible)
3. Split complex tests into smaller units
4. Use integration tests for complex flows

---

## Next Steps (Immediate)

1. **Complete this session** ✅
   - Commit infrastructure improvements
   - Document findings and solutions
   - Create this action plan

2. **Schedule next session**
   - Focus: Timeout investigation
   - Duration: 2-3 hours
   - Goal: Fix 10+ timeout failures

3. **Pre-work for next session**
   - Review timeout test code
   - Research userEvent timing issues
   - Identify quick wins

---

## Resources & References

### Documentation Created
- `week6-day2-test-infrastructure-improvements.md`
- `week6-day2-clipboard-testing-analysis.md`
- `week6-day2-session-final-summary.md`
- `week6-day2-action-plan.md` (this document)

### External Resources
- [Testing Library - Async Utilities](https://testing-library.com/docs/dom-testing-library/api-async/)
- [Vitest - Mocking](https://vitest.dev/guide/mocking.html)
- [userEvent API](https://testing-library.com/docs/user-event/intro/)

### Internal Patterns
- UI-feedback testing (clipboard example)
- Async query patterns (findBy vs getBy)
- Mock setup/cleanup (beforeEach/afterEach)

---

**Action Plan Status**: Active  
**Next Review**: After Session 3 completion  
**Owner**: Development Team  
**Last Updated**: 2025-11-17
