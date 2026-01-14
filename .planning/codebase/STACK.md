# Technology Stack

**Analysis Date:** 2026-01-14

## Languages

**Primary:**
- TypeScript ~5.8.3 - All application code (`package.json`, `tsconfig.json`)

**Secondary:**
- Rust - Backend runtime via Tauri framework (`src-tauri/Cargo.toml`)
- JavaScript - Build scripts, config files
- HTML/CSS - Standard web technologies (JSX + Tailwind CSS)

## Runtime

**Environment:**
- Node.js - Development environment (Vite dev server)
- Tauri v2 - Desktop app runtime (`src-tauri/Cargo.toml`, `package.json`)
- Target platforms: Linux, Windows, macOS (configured in `src-tauri/tauri.conf.json`)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.1.0 - UI framework (`package.json`)
- Tauri 2.0 - Desktop application shell (`@tauri-apps/api`, `@tauri-apps/cli`)

**3D Visualization:**
- Three.js ^0.182.0 - 3D rendering engine (`package.json`)
- React Three Fiber ^9.4.2 - React renderer for Three.js (`@react-three/fiber`)
- React Three Drei ^10.7.7 - Helper components (OrbitControls, Grid, Camera)

**State Management:**
- Zustand ^5.0.9 - Lightweight state management with localStorage persistence

**Testing:**
- Not configured (no test framework installed)

**Build/Dev:**
- Vite 7.0.4 - Frontend build tool with React plugin (`vite.config.ts`)
- TypeScript ~5.8.3 - Compilation to JavaScript
- Tailwind CSS 4.1.18 - Styling via `@tailwindcss/vite`
- PostCSS 8.5.6 - CSS processing pipeline

## Key Dependencies

**Critical:**
- `zustand ^5.0.9` - Global state management with persistence (`src/store/cabinetStore.ts`)
- `three ^0.182.0` - 3D cabinet visualization (`src/components/Preview3D.tsx`)
- `@react-three/fiber ^9.4.2` - React integration with Three.js scene
- `@react-three/drei ^10.7.7` - 3D helpers (OrbitControls, Grid)

**UI Components:**
- `lucide-react ^0.562.0` - Icon library
- `clsx ^2.1.1` - Conditional className utility
- `tailwind-merge ^3.4.0` - Tailwind class merging

**Infrastructure:**
- `@tauri-apps/api ^2` - Tauri core APIs for desktop features
- `@tauri-apps/plugin-opener ^2` - File/URL opener plugin
- `@tauri-apps/cli ^2` - Build/development CLI

## Configuration

**Environment:**
- No environment variables required for core functionality
- Charta API configuration stored in localStorage (key: `ligna-charta-config`)
- Application state persisted to localStorage (key: `ligna-cabinet-storage`)

**Build:**
- `vite.config.ts` - Vite configuration with React + Tailwind plugins
- `tsconfig.json` - TypeScript: ES2020 target, strict mode, bundler module resolution
- `src-tauri/tauri.conf.json` - Tauri window config (1280x800), CSP settings

## Platform Requirements

**Development:**
- Any platform with Node.js (macOS, Linux, Windows)
- Rust toolchain required for Tauri builds
- VS Code recommended with Tauri + rust-analyzer extensions (`README.md`)

**Production:**
- Desktop application distributed via:
  - Linux: AppImage, deb package (`src-tauri/target/release/bundle/`)
  - Windows: MSI installer
  - macOS: DMG bundle
- Runs on user's system (no Node.js required after build)

---

*Stack analysis: 2026-01-14*
*Update after major dependency changes*
