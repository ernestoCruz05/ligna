# Coding Conventions

**Analysis Date:** 2026-01-14

## Naming Patterns

**Files:**
- PascalCase for React components: `Header.tsx`, `CabinetVisualizer.tsx`, `PatternEditor.tsx`
- camelCase for utilities/stores: `cabinetStore.ts`, `cabinetLogic.ts`, `chartaApi.ts`
- camelCase for data files: `defaultPatterns.ts`, `defaultMaterials.ts`
- Test files: `*.test.ts` alongside source (convention, not yet used)

**Functions:**
- camelCase for all functions: `calculateParts()`, `evaluateExpression()`, `buildExpressionContext()`
- No special prefix for async functions
- Handler pattern: `handleEventName` (`handleDimensionChange`, `handleExportCSV`)
- Hook pattern: `use` prefix (`useCabinetStore`, `useMemo`, `useState`)
- Selector hooks: `use{Entity}` (`useGlobalSettings`, `useMaterials`, `useSelectedCabinet`)
- Boolean functions: `is` prefix (`isChartaConfigured`)

**Variables:**
- camelCase: `selectedCabinet`, `currentProject`, `materialThickness`
- Boolean prefixes: `is/has` (`isDarkMode`, `isExporting`, `isConfigured`)
- State pairs: `[value, setValue]` (`[sidebarOpen, setSidebarOpen]`)
- Expression context keys: snake_case (`total_height`, `material_thickness`, `internal_width`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_VALIDATION_LIMITS`, `STORAGE_KEY`)

**Types:**
- PascalCase for interfaces: `Material`, `CabinetPattern`, `CabinetInstance`
- No `I` prefix: `User` not `IUser`
- Props suffix: `HeaderProps`, `SidebarProps`, `CabinetVisualizerProps`
- Suffix patterns:
  - `-Config` for configurations: `BackPanelConfig`, `ChartaConfig`
  - `-Rule` for rules: `PartRule`, `HardwareRule`, `ValidationRule`
  - `-Result` for return types: `ValidationResult`
  - `-State` for state shapes: `UIState`

## Code Style

**Formatting:**
- 2-space indentation
- Semicolons required
- Single quotes for imports and strings
- Double quotes for JSX attributes
- Line length: ~80-100 characters
- No trailing whitespace

**Linting:**
- No ESLint configured
- No Prettier configured
- Type safety via TypeScript strict mode
- `tsconfig.json` strict settings: `strict: true`, `noUnusedLocals: true`

## Import Organization

**Order:**
1. React imports (`import React from 'react'`, `import { useState } from 'react'`)
2. External packages (`lucide-react`, `zustand`, `three`)
3. Internal modules (`../store/cabinetStore`, `../utils/cn`)
4. Relative imports (`./ComponentName`)
5. Type imports (`import type { ... }`)

**Grouping:**
- Blank line between groups
- Related imports on same line when reasonable
- Type imports at end of import block

**Path Aliases:**
- No path aliases configured
- Relative imports used throughout (`../`, `./`)

## Error Handling

**Patterns:**
- Try/catch at async operation boundaries
- ErrorBoundary for React render errors (`src/components/ErrorBoundary.tsx`)
- Expression evaluation fails safe (returns 0)
- localStorage reset on corrupted state

**Error Types:**
- Throw on configuration errors
- Return null/undefined for missing data
- Silent fallback for non-critical failures
- Console.warn for development debugging

**Async:**
- Async/await preferred over `.then()` chains
- `.catch()` for promise rejection handling in components

## Logging

**Framework:**
- Console.log/warn/error (browser dev tools)
- No external logging service

**Patterns:**
- `console.warn()` for non-critical issues
- `console.error()` for failures
- Development-only logging (no production logging strategy)

**When:**
- Expression evaluation failures
- API call failures
- State persistence errors

## Comments

**When to Comment:**
- Explain "why" not "what"
- Document complex business logic
- Section dividers for large files

**JSDoc/TSDoc:**
- Used for exported functions with parameters
- Interface fields have inline comments
- Example from `src/utils/cabinetLogic.ts`:
  ```typescript
  /**
   * Safely evaluates arithmetic expressions with variable substitution.
   * Only allows basic math operations: +, -, *, /, (), and numbers.
   */
  export function evaluateExpression(...)
  ```

**Section Dividers:**
```typescript
// ============================================
// SECTION NAME
// ============================================
```

**TODO Comments:**
- Format: `// TODO: description`
- No username convention (use git blame)

## Function Design

**Size:**
- Keep under ~100 lines where possible
- Large components exist but should be refactored (PatternEditor: 1,259 lines)

**Parameters:**
- Max 3-4 parameters preferred
- Use options object for many parameters
- Destructuring in parameter list: `function process({ id, name }: Props)`

**Return Values:**
- Explicit return statements
- Return early for guard clauses
- Return null for "not found" cases

## Module Design

**Exports:**
- Named exports preferred for utilities/hooks
- Default exports for React components
- Barrel exports via `index.ts` files

**Barrel Files:**
- `src/components/index.ts` - Re-exports all components
- `src/store/index.ts` - Re-exports store and hooks
- `src/utils/index.ts` - Re-exports utilities

**Component Structure:**
```typescript
// Imports
import { useState } from 'react';
import { useCabinetStore } from '../store/cabinetStore';

// Types
interface ComponentProps {
  className?: string;
}

// Component
export function Component({ className }: ComponentProps) {
  // Hooks
  const { state, action } = useCabinetStore();

  // Derived state (useMemo)
  const computed = useMemo(() => ..., [deps]);

  // Handlers
  const handleClick = () => { ... };

  // Render
  return (
    <div className={className}>
      ...
    </div>
  );
}

// Default export (optional)
export default Component;
```

## React Patterns

**State Management:**
- Zustand for global state (`useCabinetStore()`)
- useState for component-local state
- useMemo for expensive computations
- useCallback for stable function references (rare)

**Props:**
- Optional `className` prop for styling flexibility
- Typed with interface above component
- Destructured in function signature

**CSS:**
- Tailwind CSS classes
- `cn()` utility for conditional classes
- Dark mode via `dark:` prefix
- Custom properties in `App.css`

---

*Convention analysis: 2026-01-14*
*Update when patterns change*
