# Codebase Structure

**Analysis Date:** 2026-01-14

## Directory Layout

```
Ligna/
├── src/                    # Frontend source (React/TypeScript)
│   ├── components/        # React UI components
│   ├── store/             # Zustand state management
│   ├── services/          # External API clients
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Business logic utilities
│   ├── data/              # Default library data
│   ├── i18n/              # Internationalization
│   ├── assets/            # Static assets
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Root component
│   └── App.css            # Global styles
├── src-tauri/             # Tauri desktop backend (Rust)
│   ├── src/               # Rust source files
│   ├── capabilities/      # Permission capabilities
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── public/                # Static assets served
├── index.html             # HTML entry
├── package.json           # NPM dependencies
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite build config
└── README.md              # Documentation
```

## Directory Purposes

**src/components/**
- Purpose: React UI components
- Contains: 14 TSX component files (~5,500 lines total)
- Key files:
  - `CabinetVisualizer.tsx` (627 lines) - 2D SVG cabinet visualization
  - `Preview3D.tsx` (667 lines) - 3D Three.js visualization modal
  - `PatternEditor.tsx` (1,259 lines) - Pattern definition editor
  - `CutListModal.tsx` (551 lines) - Cut list export modal
  - `Header.tsx`, `Sidebar.tsx`, `PropertiesPanel.tsx` - Main layout
  - `MaterialsPanel.tsx`, `HardwarePanel.tsx`, `RulesPanel.tsx` - Library editors
  - `ValidationPanel.tsx` - Validation results display
  - `ErrorBoundary.tsx` - Error handling wrapper
  - `ChartaConfigModal.tsx` (221 lines) - Charta API configuration
  - `index.ts` - Component barrel export
- Subdirectories: None (flat structure)

**src/store/**
- Purpose: Global state management
- Contains: Zustand store with persistence
- Key files:
  - `cabinetStore.ts` (749 lines) - Main store with all state and actions
  - `index.ts` - Store exports
- Subdirectories: None

**src/services/**
- Purpose: External API integrations
- Contains: Charta REST client
- Key files:
  - `chartaApi.ts` - Charta API client, file export utilities
- Subdirectories: None

**src/types/**
- Purpose: TypeScript type definitions
- Contains: All domain model interfaces
- Key files:
  - `index.ts` (787 lines) - All types: Material, HardwareItem, CabinetPattern, Project, etc.
- Subdirectories: None

**src/utils/**
- Purpose: Business logic utilities
- Contains: Expression evaluation, part calculations, CSS helpers
- Key files:
  - `cabinetLogic.ts` (512 lines) - Expression evaluator, context builder, part calculator
  - `cn.ts` - CSS class merging (clsx + tailwind-merge)
  - `index.ts` - Utility exports
- Subdirectories: None

**src/data/**
- Purpose: Default library data
- Contains: Pre-built templates and sample data
- Key files:
  - `defaultPatterns.ts` - Cabinet templates (base units, wall cabinets)
  - `defaultMaterials.ts` - Material library (MDF, plywood, melamine)
  - `defaultHardware.ts` - Hardware components (hinges, slides, handles)
- Subdirectories: None

**src/i18n/**
- Purpose: Internationalization strings
- Contains: Translation files
- Key files:
  - `pt.ts` - Portuguese translations
- Subdirectories: None

**src-tauri/src/**
- Purpose: Tauri Rust backend
- Contains: Minimal desktop integration
- Key files:
  - `main.rs` - Tauri app entry point
  - `lib.rs` (15 lines) - Single command handler (`greet`)
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `index.html` - HTML entry, loads `src/main.tsx`
- `src/main.tsx` - React DOM render with ErrorBoundary
- `src/App.tsx` - Root component with main layout
- `src-tauri/src/main.rs` - Tauri desktop entry

**Configuration:**
- `package.json` - NPM dependencies, scripts
- `tsconfig.json` - TypeScript: ES2020, strict mode
- `vite.config.ts` - Vite: React plugin, dev server port 1420
- `src-tauri/tauri.conf.json` - Window size (1280x800), CSP, bundler settings

**Core Logic:**
- `src/store/cabinetStore.ts` - All application state and actions
- `src/utils/cabinetLogic.ts` - Parametric calculations, expression evaluator
- `src/types/index.ts` - All TypeScript interfaces

**Testing:**
- No test files present

**Documentation:**
- `README.md` - Basic setup instructions

## Naming Conventions

**Files:**
- PascalCase.tsx - React components (`Header.tsx`, `CabinetVisualizer.tsx`)
- camelCase.ts - Utilities, stores, services (`cabinetStore.ts`, `chartaApi.ts`)
- camelCase.ts - Data files (`defaultPatterns.ts`)
- UPPERCASE.md - Important project files (`README.md`)

**Directories:**
- kebab-case - All directories (`src-tauri`, `node_modules`)
- Plural - Collections (`components/`, `services/`, `types/`)
- Singular - Single-purpose (`store/`, `i18n/`)

**Special Patterns:**
- `index.ts` - Barrel exports for directories
- `*.test.ts` - Test files (not present, but convention)
- `default*.ts` - Default data files

## Where to Add New Code

**New Component:**
- Primary code: `src/components/{ComponentName}.tsx`
- Props interface: Define in same file or `src/types/index.ts` if shared
- Export: Add to `src/components/index.ts`

**New Feature/Module:**
- Logic: `src/utils/{featureName}.ts`
- Types: Add interfaces to `src/types/index.ts`
- State: Add to `src/store/cabinetStore.ts`
- Tests: `src/utils/{featureName}.test.ts` (create test setup first)

**New External Service:**
- Implementation: `src/services/{serviceName}.ts`
- Types: Add to `src/types/index.ts`
- Config: Store in localStorage (follow chartaApi pattern)

**New Route/Command (Tauri):**
- Definition: `src-tauri/src/lib.rs`
- Frontend call: Via `@tauri-apps/api`

**Utilities:**
- Shared helpers: `src/utils/{name}.ts`
- Type definitions: `src/types/index.ts`
- CSS utilities: Extend `src/utils/cn.ts`

## Special Directories

**src-tauri/target/**
- Purpose: Rust build output
- Source: Generated by `cargo build`
- Committed: No (in `.gitignore`)

**node_modules/**
- Purpose: NPM dependencies
- Source: Generated by `npm install`
- Committed: No (in `.gitignore`)

**dist/**
- Purpose: Vite production build output
- Source: Generated by `npm run build`
- Committed: No (in `.gitignore`)

**.planning/codebase/**
- Purpose: Codebase documentation (this document)
- Source: Generated by GSD map-codebase
- Committed: Yes

---

*Structure analysis: 2026-01-14*
*Update when directory structure changes*
