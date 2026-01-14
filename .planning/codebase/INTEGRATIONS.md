# External Integrations

**Analysis Date:** 2026-01-14

## APIs & External Services

**Charta Document Management:**
- Charta - Document management system for project file uploads
  - SDK/Client: Custom REST client in `src/services/chartaApi.ts`
  - Auth: API key via `X-API-Key` header (optional)
  - Endpoints used:
    - GET `/api/projects?status=active` - List active projects
    - POST `/api/upload` - File upload with FormData
    - PATCH `/api/documents/{id}/assign` - Assign document to project
  - Configuration: User-provided base URL stored in localStorage

**Payment Processing:**
- Not applicable

**Email/SMS:**
- Not applicable

**External APIs:**
- Not applicable (local-only application)

## Data Storage

**Databases:**
- None - All data stored client-side

**Local Storage:**
- Browser localStorage - Primary data persistence
  - Key: `ligna-cabinet-storage` - Application state (projects, patterns, materials, hardware)
  - Key: `ligna-charta-config` - Charta API configuration
  - Implementation: Zustand middleware with `persist()` in `src/store/cabinetStore.ts`

**File Storage:**
- Not applicable (no cloud storage)

**Caching:**
- Not applicable (no external caching)

## Authentication & Identity

**Auth Provider:**
- None - Local desktop application with no authentication

**Charta API Auth:**
- Optional API key authentication
  - Storage: localStorage (`ligna-charta-config`)
  - Header: `X-API-Key` when present
  - Validation: `testChartaConnection()` in `src/services/chartaApi.ts`

**OAuth Integrations:**
- Not applicable

## Monitoring & Observability

**Error Tracking:**
- Not applicable (no external error tracking)
- Local error boundary: `src/components/ErrorBoundary.tsx`

**Analytics:**
- Not applicable

**Logs:**
- Console only (browser dev tools)
- No external logging service

## CI/CD & Deployment

**Hosting:**
- Desktop application (self-hosted on user machine)
- Build outputs: `src-tauri/target/release/bundle/`
  - AppImage for Linux
  - Deb package for Debian-based Linux
  - MSI for Windows
  - DMG for macOS

**CI Pipeline:**
- Not configured (no `.github/workflows/` detected)

## Environment Configuration

**Development:**
- Required env vars: None
- Secrets location: localStorage (for Charta API key)
- Mock/stub services: None required

**Staging:**
- Not applicable (desktop app)

**Production:**
- Secrets management: User enters Charta credentials via UI (`src/components/ChartaConfigModal.tsx`)
- No server-side configuration needed

## Webhooks & Callbacks

**Incoming:**
- Not applicable (desktop application)

**Outgoing:**
- Not applicable

## Browser APIs Used

**Storage & Data:**
- localStorage - State persistence
- URL API - Object URL creation for blob handling

**UI & Rendering:**
- Canvas API - Image generation from SVG (`svgToPng()` in `src/services/chartaApi.ts`)
- XMLSerializer - SVG serialization for export
- DOM APIs - Element selection, measurement

**Network:**
- Fetch API - HTTP requests to Charta server

**Printing:**
- window.print() - PDF generation via browser print dialog

## File Export Formats

**Supported Exports:**
- CSV - Cut list export (`generateCutListCSV()` in `src/services/chartaApi.ts`)
- PDF - Via browser print dialog (`generateCutListPDF()`)
- PNG - SVG visualization export (`svgToPng()`)

**Charta Upload Formats:**
- CSV files
- PNG images (cabinet visualizations)

## Tauri Desktop Integration

**Native Features:**
- `@tauri-apps/plugin-opener` - System file/URL opener
- Window management via Tauri config
- Cross-platform builds

**Rust Backend:**
- Minimal implementation in `src-tauri/src/lib.rs`
- Single command: `greet` (bootstrapped, not actively used)

## Localization

**Language Support:**
- Portuguese (Brazil/Portugal) - `src/i18n/pt.ts`
- All UI strings internationalized via `pt` object

---

*Integration audit: 2026-01-14*
*Update when adding/removing external services*
