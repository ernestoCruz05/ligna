# Testing Patterns

**Analysis Date:** 2026-01-14

## Test Framework

**Runner:**
- Not configured (no test framework installed)

**Assertion Library:**
- Not applicable

**Run Commands:**
```bash
# No test commands configured in package.json
# Recommended setup:
npm test                              # Run all tests
npm test -- --watch                   # Watch mode
npm test -- path/to/file.test.ts     # Single file
npm run test:coverage                 # Coverage report
```

## Test File Organization

**Location:**
- No test files exist
- Recommended: `*.test.ts` alongside source files (co-located)

**Naming:**
- Recommended convention: `{module-name}.test.ts`
- Example: `cabinetLogic.test.ts`, `CabinetVisualizer.test.tsx`

**Structure (Recommended):**
```
src/
  utils/
    cabinetLogic.ts
    cabinetLogic.test.ts      # Co-located test
  components/
    Header.tsx
    Header.test.tsx           # Co-located test
  store/
    cabinetStore.ts
    cabinetStore.test.ts      # Co-located test
```

## Test Structure

**Suite Organization (Recommended):**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // reset state
    });

    it('should handle valid input', () => {
      // arrange
      const input = createTestInput();

      // act
      const result = functionName(input);

      // assert
      expect(result).toEqual(expectedOutput);
    });

    it('should throw on invalid input', () => {
      expect(() => functionName(null)).toThrow('Invalid input');
    });
  });
});
```

**Patterns:**
- Not established (no existing tests)
- Recommended: beforeEach for per-test setup
- Recommended: explicit arrange/act/assert structure

## Mocking

**Framework:**
- Not configured
- Recommended: Vitest built-in mocking (vi)

**Patterns (Recommended):**
```typescript
import { vi } from 'vitest';

// Mock module
vi.mock('./external', () => ({
  externalFunction: vi.fn()
}));

// Mock in test
const mockFn = vi.mocked(externalFunction);
mockFn.mockReturnValue('mocked result');
```

**What to Mock:**
- localStorage operations
- External API calls (Charta)
- Browser APIs (canvas, fetch)
- Complex dependencies

**What NOT to Mock:**
- Internal pure functions
- Simple utilities
- TypeScript types

## Fixtures and Factories

**Test Data (Recommended):**
```typescript
// Factory pattern for test data
function createTestCabinet(overrides?: Partial<CabinetInstance>): CabinetInstance {
  return {
    id: 'test-cabinet-1',
    patternId: 'base-unit',
    dimensions: { height: 720, width: 600, depth: 560 },
    ...overrides
  };
}

function createTestPattern(overrides?: Partial<CabinetPattern>): CabinetPattern {
  return {
    id: 'test-pattern',
    name: 'Test Pattern',
    zones: [],
    partRules: [],
    ...overrides
  };
}
```

**Location:**
- Recommended: Factory functions in test file or `src/__tests__/fixtures/`

## Coverage

**Requirements:**
- Not configured
- No coverage target defined

**Configuration:**
- Recommended: Vitest coverage via c8
- Suggested target: 80% for critical paths

**View Coverage (Recommended):**
```bash
npm run test:coverage
open coverage/index.html
```

## Test Types

**Unit Tests (Recommended Priority):**
- `evaluateExpression()` - Expression parsing edge cases
- `buildExpressionContext()` - Context variable resolution
- `calculateParts()` - Part calculation accuracy
- `validateCabinet()` - Validation logic

**Integration Tests (Recommended):**
- Store actions + calculations
- Pattern → Parts → Cut list flow
- Charta API integration (mocked)

**E2E Tests:**
- Not applicable (desktop app)
- Manual testing via Tauri

## Common Patterns

**Async Testing (Recommended):**
```typescript
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBe('expected');
});
```

**Error Testing (Recommended):**
```typescript
it('should throw on invalid input', () => {
  expect(() => parse(null)).toThrow('Cannot parse null');
});

// Async error
it('should reject on failure', async () => {
  await expect(asyncCall()).rejects.toThrow('Error message');
});
```

**Expression Evaluation Testing (Recommended):**
```typescript
describe('evaluateExpression', () => {
  it('should evaluate simple expressions', () => {
    const context = { total_height: 720, thickness: 18 };
    expect(evaluateExpression('total_height - 2 * thickness', context)).toBe(684);
  });

  it('should reject unsafe expressions', () => {
    const context = { x: 10 };
    expect(evaluateExpression('console.log("hack")', context)).toBe(0);
  });
});
```

**Snapshot Testing:**
- Not recommended for this codebase
- Prefer explicit assertions

## Recommended Setup

**Install Vitest:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Create vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['node_modules', '*.config.ts']
    }
  }
});
```

**Add scripts to package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Critical Functions to Test First

1. **`evaluateExpression()`** - Core calculation engine, security-sensitive
2. **`buildExpressionContext()`** - Variable resolution, construction methods
3. **`calculateParts()`** - Cut list generation accuracy
4. **`validateCabinet()`** - Validation logic correctness
5. **Store actions** - State mutation correctness
6. **Charta API client** - Request/response handling

---

*Testing analysis: 2026-01-14*
*Update when test patterns change*
