# Ligna

## What This Is

A desktop cabinet-making application that generates accurate cut lists from parametric cabinet designs. Users design cabinets using customizable patterns, and the app calculates precise measurements for each part, accounting for material relationships and construction methods.

## Core Value

Accurate part measurements that correctly account for material thickness, edge banding, and joint types — so the cut list can be trusted and used directly in the workshop.

## Requirements

### Validated

- ✓ Cabinet pattern system (reusable templates for cabinet types) — existing
- ✓ Cabinet instance creation from patterns with custom dimensions — existing
- ✓ Parametric expression evaluation engine — existing
- ✓ 2D SVG cabinet visualization — existing
- ✓ 3D cabinet preview with Three.js — existing
- ✓ Cut list generation via calculateParts() — existing
- ✓ RuleSet system for construction rules (European/American style) — existing
- ✓ Zustand state management with localStorage persistence — existing
- ✓ Three-tier validation system (errors, warnings, info) — existing
- ✓ Dark mode support — existing
- ✓ Portuguese localization — existing

### Active

- [ ] Accurate measurements accounting for material thickness relationships
- [ ] Accurate measurements accounting for edge banding in dimensions
- [ ] Accurate measurements accounting for joint/connection types
- [ ] Material assignment per part (different materials for doors, shelves, carcass)
- [ ] Research: how cabinet parts affect each other's dimensions in cutting

### Out of Scope

- Cut optimization/nesting — focus on measurements first, optimization is a separate problem
- Pricing/costing — not needed for v1, can add later

## Context

**Existing Codebase:**
- Tauri v2 desktop app with React 19 frontend
- Parametric system already evaluates expressions like `"total_height - 2 * thickness"`
- `cabinetLogic.ts` handles part calculations
- `cabinetStore.ts` manages state with Zustand
- Patterns define cabinet structure with zones, columns, part rules, hardware rules
- RuleSet abstraction exists for construction method differences

**Current State:**
- App is "kind of working" — generates measurements but material relationships need improvement
- Material thickness affects dimensions but implementation may have gaps
- Edge banding and joint types not fully integrated into calculations

**Research Needed:**
- How pieces affect each other in cutting (material relationships)
- Which calculation approach produces the most accurate real-world measurements

## Constraints

- **Tech stack**: Must stay with Tauri + React + TypeScript — existing investment and expertise

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep existing pattern/RuleSet architecture | Already working, extend rather than replace | — Pending |
| Focus on measurement accuracy before optimization | Optimization is meaningless if measurements are wrong | — Pending |

---
*Last updated: 2026-01-14 after initialization*
