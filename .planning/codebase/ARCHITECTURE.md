# Architecture

**Analysis Date:** 2026-01-14

## Pattern Overview

**Overall:** Monolithic SPA with Tauri Desktop Shell

**Key Characteristics:**
- Client-side heavy (all logic in React frontend)
- Minimal Rust backend (only system integration via Tauri)
- Component-driven UI architecture
- Parametric expression evaluation engine
- Persistent state via localStorage

## Layers

**Presentation Layer:**
- Purpose: User interface and visualization
- Contains: React components (modals, panels, editors, visualizers)
- Location: `src/components/*.tsx`
- Depends on: Store layer for state, Utils layer for calculations
- Used by: App entry point (`src/App.tsx`)

**State Management Layer:**
- Purpose: Centralized application state with persistence
- Contains: Zustand store, selector hooks, state actions
- Location: `src/store/cabinetStore.ts`
- Depends on: Types layer for interfaces
- Used by: All presentation components

**Business Logic Layer:**
- Purpose: Parametric calculations and expression evaluation
- Contains: Safe expression evaluator, part calculations, validation
- Location: `src/utils/cabinetLogic.ts`
- Depends on: Types layer for interfaces
- Used by: Store layer, presentation components

**Service Layer:**
- Purpose: External API integration
- Contains: Charta API client, file export utilities
- Location: `src/services/chartaApi.ts`
- Depends on: Types layer, browser APIs
- Used by: Presentation components (modals)

**Data Layer:**
- Purpose: Default library data and type definitions
- Contains: Default patterns, materials, hardware, types
- Location: `src/types/index.ts`, `src/data/*.ts`
- Depends on: Nothing
- Used by: Store initialization, all layers

**Desktop Backend Layer:**
- Purpose: Native desktop integration
- Contains: Tauri window management, system commands
- Location: `src-tauri/src/*.rs`
- Depends on: Tauri framework
- Used by: Frontend via `@tauri-apps/api`

## Data Flow

**Cabinet Design Workflow:**

1. User modifies cabinet via UI (Header, Sidebar, PropertiesPanel)
2. Component calls store action (e.g., `updateCabinet()`)
3. Zustand store updates state
4. Store triggers localStorage sync (automatic via middleware)
5. React re-renders affected components
6. `buildExpressionContext()` builds calculation context
7. `evaluateExpression()` resolves parametric expressions
8. `calculateParts()` generates cut list
9. Visualizers render (2D SVG in `CabinetVisualizer`, 3D in `Preview3D`)
10. Validation runs (`validateCabinet()`)

**Expression Evaluation:**

```
Pattern Definition → buildExpressionContext() → evaluateExpression() → Result
     ↓                        ↓                        ↓
"total_height - 2 * thickness"  {total_height: 720,    → "(720 - 2 * 18)"
                                 thickness: 18, ...}   → 684
```

**State Management:**
- Stateless components read from store via hooks
- Actions dispatch updates through Zustand
- Middleware persists to localStorage automatically
- On app load, state restored from localStorage

## Key Abstractions

**CabinetPattern:**
- Purpose: Reusable template defining cabinet structure
- Examples: `src/data/defaultPatterns.ts` (base-unit-2-drawers, wall-cabinet)
- Pattern: Configuration object with zones, columns, part rules, hardware rules

**CabinetInstance:**
- Purpose: Instantiated cabinet from pattern with specific dimensions
- Examples: Created via `addCabinet()` in store
- Pattern: References pattern by ID, adds dimensions and overrides

**RuleSet:**
- Purpose: Construction rules defining how cabinets are built
- Examples: European style (sides-on-bottom), American style (bottom-between-sides)
- Pattern: Configuration object with construction methods, material assignments, offsets

**ExpressionContext:**
- Purpose: Variables available for parametric expression evaluation
- Examples: `total_height`, `material_thickness`, `internal_width`
- Pattern: Object with string keys mapping to numeric values

**Safe Expression Evaluator:**
- Purpose: Evaluate arithmetic expressions without code injection
- Examples: `"total_height - 2 * thickness"` → `684`
- Pattern: Regex validation + `new Function()` with strict mode

## Entry Points

**Frontend Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads `index.html`
- Responsibilities: Mount React app with ErrorBoundary

**Root Component:**
- Location: `src/App.tsx`
- Triggers: React render
- Responsibilities: Layout (Header, Sidebar, Visualizer, PropertiesPanel), dark mode

**Store Initialization:**
- Location: `src/store/cabinetStore.ts` (module-level `create()`)
- Triggers: Module import
- Responsibilities: Create store, restore from localStorage, provide hooks

**Tauri Entry:**
- Location: `src-tauri/src/main.rs`
- Triggers: Desktop app launch
- Responsibilities: Initialize Tauri window, register plugins

## Error Handling

**Strategy:** Component-level try/catch with ErrorBoundary fallback

**Patterns:**
- ErrorBoundary at app root catches render errors (`src/components/ErrorBoundary.tsx`)
- Async operations use `.catch()` or try/catch
- Expression evaluation fails safe (returns 0 on error)
- Invalid inputs rejected with validation messages

## Cross-Cutting Concerns

**Logging:**
- Console.log/warn/error for development
- No production logging service

**Validation:**
- Three-tier system: errors, warnings, info
- Defined in `DEFAULT_VALIDATION_LIMITS` (`src/types/index.ts`)
- Runs via `validateCabinet()` and `validateProject()`

**State Persistence:**
- Automatic via Zustand `persist()` middleware
- Selective: Only serializable state persisted (not functions)
- Storage key: `ligna-cabinet-storage`

**Internationalization:**
- All UI strings via `pt` object from `src/i18n/pt.ts`
- Single language: Portuguese

**Dark Mode:**
- Toggle in store (`ui.isDarkMode`)
- Applied via Tailwind `dark:` classes
- CSS custom properties in `src/App.css`

---

*Architecture analysis: 2026-01-14*
*Update when major patterns change*
