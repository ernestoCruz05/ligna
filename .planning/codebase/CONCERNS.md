# Codebase Concerns

**Analysis Date:** 2026-01-14

## Tech Debt

**PatternEditor Component Size:**
- Issue: Single file with 1,259 lines handling multiple responsibilities
- Files: `src/components/PatternEditor.tsx`
- Why: Rapid development, incremental feature additions
- Impact: Difficult to maintain, test, or extend; complex state synchronization
- Fix approach: Extract into smaller components (ColumnEditor, ZoneEditor, ProportionSlider), create custom hook for proportion state

**Multiple Sources of Truth for Proportions:**
- Issue: Column proportions stored in both `columns[].widthPercentage` and `columnProportions` state
- Files: `src/components/PatternEditor.tsx` (lines 246-286)
- Why: Added local state for drag interactions without refactoring
- Impact: Potential sync bugs when changes made in one place don't propagate
- Fix approach: Single source of truth in store, derived local state for UI interactions

**CSV Export Logic Duplication:**
- Issue: CSV generation logic exists in two places
- Files: `src/services/chartaApi.ts` (lines 242-259), `src/utils/cabinetLogic.ts` (lines 364-425)
- Why: Copied for different export contexts
- Impact: Changes must be made in two places; risk of divergence
- Fix approach: Extract shared `generateCSV()` utility, import in both locations

## Known Bugs

**useMemo Used for Side Effects:**
- Symptoms: API calls made during render via useMemo
- Trigger: Opening CutListModal when Charta is configured
- Files: `src/components/CutListModal.tsx` (lines 141-147)
- Workaround: Works but violates React best practices
- Root cause: useMemo returns no value; should be useEffect
- Fix: Replace with useEffect for side effects

## Security Considerations

**API Keys in localStorage:**
- Risk: XSS vulnerability could steal Charta API keys
- Files: `src/services/chartaApi.ts` (line 53), `src/components/ChartaConfigModal.tsx`
- Current mitigation: None (plaintext storage)
- Recommendations: Consider Tauri secure storage, warn users about key sensitivity

**Dynamic Code Evaluation:**
- Risk: Expression evaluator uses `new Function()` constructor
- Files: `src/utils/cabinetLogic.ts` (line 51)
- Current mitigation: Regex validation restricts to math operators only (`/^[\d\s+\-*/().]+$/`)
- Recommendations: Pattern is reasonable for sandboxed use; consider dedicated expression parser library for extra safety

**Unvalidated External URLs:**
- Risk: User-provided Charta baseUrl fetched without validation (potential SSRF)
- Files: `src/services/chartaApi.ts` (lines 87, 113, 145, 160)
- Current mitigation: None
- Recommendations: Add URL format validation, consider hostname whitelist

## Performance Bottlenecks

**No pagination for Charta projects:**
- Problem: Fetches all projects without limit
- Files: `src/services/chartaApi.ts` (line 113)
- Measurement: Could timeout with thousands of projects
- Cause: API call has no pagination parameters
- Improvement path: Add pagination or limit parameter to API calls

**Parts recalculated on every state change:**
- Problem: Cut list recalculates for all cabinets on any state change
- Files: `src/components/CutListModal.tsx` (lines 149-168)
- Measurement: Noticeable delay with many cabinets
- Cause: useMemo dependencies trigger full recalculation
- Improvement path: Add debouncing, cache per-cabinet results

## Fragile Areas

**Expression Evaluation Chain:**
- Files: `src/utils/cabinetLogic.ts` (lines 18-224)
- Why fragile: Complex variable substitution with 40+ context variables
- Common failures: Typos in expression variables return 0 silently
- Safe modification: Add logging for failed evaluations; test all variables
- Test coverage: None

**Proportion Drag Interactions:**
- Files: `src/components/PatternEditor.tsx` (lines 465-535)
- Why fragile: Complex mouse event handling with multiple state updates
- Common failures: Proportions don't sum to 100%, visual glitches during drag
- Safe modification: Ensure all proportion arrays are normalized after changes
- Test coverage: None

## Scaling Limits

**localStorage Size:**
- Current capacity: ~5MB browser limit
- Limit: Large projects with many cabinets could exceed storage
- Symptoms at limit: State persistence fails silently
- Scaling path: Consider IndexedDB for larger data, or file-based persistence via Tauri

**3D Rendering:**
- Current capacity: Works with typical cabinet counts (~20-50)
- Limit: Performance degrades with many complex cabinets in 3D view
- Symptoms at limit: Slow rendering, unresponsive UI
- Scaling path: Instance geometry, LOD, culling of off-screen objects

## Dependencies at Risk

**React 19:**
- Risk: Recently released (Jan 2025), ecosystem still catching up
- Impact: Some third-party libraries may have compatibility issues
- Migration plan: Monitor for issues, keep React version stable

## Missing Critical Features

**No Test Framework:**
- Problem: Zero test files for 28 source files
- Current workaround: Manual testing
- Blocks: Confident refactoring, regression prevention
- Implementation complexity: Low (add Vitest, create initial tests)

**No Input Validation:**
- Problem: Cabinet dimensions accept any number without validation
- Files: `src/components/PatternEditor.tsx` (lines 1022-1030)
- Current workaround: Validation messages shown but invalid values not prevented
- Blocks: User can create impossible cabinets (0x0x0, negative dimensions)
- Implementation complexity: Low (add min/max validation)

## Test Coverage Gaps

**Expression Evaluation:**
- What's not tested: Core `evaluateExpression()` function
- Files: `src/utils/cabinetLogic.ts`
- Risk: Expression bugs affect all cabinet calculations silently
- Priority: High
- Difficulty to test: Low (pure function, easy to unit test)

**State Persistence:**
- What's not tested: localStorage save/restore cycle
- Files: `src/store/cabinetStore.ts`
- Risk: Data corruption could lose user work
- Priority: High
- Difficulty to test: Medium (need to mock localStorage)

**Validation Logic:**
- What's not tested: `validateCabinet()`, `validateProject()`
- Files: `src/store/cabinetStore.ts`
- Risk: Invalid cabinets not caught, or valid ones rejected
- Priority: Medium
- Difficulty to test: Low (pure functions with defined inputs)

## Error Handling Gaps

**Silent API Failures:**
- Issue: Charta API errors caught but show empty result
- Files: `src/components/CutListModal.tsx` (lines 143-145)
- Risk: Users don't know why projects aren't loading
- Fix: Show error message to user

**Missing null Checks:**
- Issue: `validateCabinet()` called with potentially undefined pattern
- Files: `src/store/cabinetStore.ts` (lines 596-597)
- Risk: Runtime error if pattern not found
- Fix: Add null check before calling validation

---

*Concerns audit: 2026-01-14*
*Update as issues are fixed or new ones discovered*
