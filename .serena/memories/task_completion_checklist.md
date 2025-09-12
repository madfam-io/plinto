# Plinto - Task Completion Checklist

## When Completing Any Development Task

### Before Marking Complete
1. **Run Type Checking**
   - `yarn typecheck` or `npm run typecheck`
   - Ensure no TypeScript errors

2. **Run Linting**
   - `yarn lint` or `npm run lint`
   - Fix any linting issues

3. **Run Tests**
   - `yarn test` - Run relevant tests
   - `yarn test:unit` - For code changes
   - `yarn test:e2e` - For UI/flow changes
   - Ensure all tests pass

4. **Code Formatting**
   - `yarn format:all` - Format code if available
   - Ensure consistent code style

5. **Build Verification**
   - `yarn build` - Verify build succeeds
   - Check for any build warnings

### Quality Checks
- Verify no console.log statements left in production code
- Check for proper error handling
- Ensure no hardcoded values or secrets
- Verify TypeScript types are properly defined
- Check that new features have appropriate tests

### Documentation
- Update relevant documentation if needed
- Add JSDoc comments for public APIs
- Update README if adding new features

### Git Hygiene
- Review changes with `git diff`
- Ensure on feature branch (not main)
- Write descriptive commit messages
- No temporary files in commit

### Final Verification
- Test the feature/fix manually
- Verify it works as expected
- Check for any regression in existing functionality

## Quick Command Sequence
```bash
# Standard completion sequence
yarn typecheck
yarn lint
yarn test
yarn build

# Or using make
make typecheck
make lint
make test
make build
```

## Notes
- The project uses strict TypeScript settings
- Tests are comprehensive (unit, integration, E2E)
- Monorepo structure means changes might affect multiple packages
- Always verify in development environment first