# Roadmap: Ligna

## Overview

Transform Ligna from a cabinet design tool with approximate measurements into one that generates workshop-ready cut lists. Starting from the existing parametric system, we'll add proper material modeling, edge banding calculations, and joint-aware dimensions — then validate everything against real cabinet scenarios.

## Domain Expertise

None

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Material System** - Create material definitions with thickness, edge banding properties
- [x] **Phase 2: Part-Material Association** - Connect parts to materials, enable per-part material assignment
- [ ] **Phase 3: Edge Banding Integration** - Calculate dimensions accounting for edge banding thickness
- [ ] **Phase 4: Joint/Connection System** - Model joint types and their dimensional impacts
- [ ] **Phase 5: Measurement Calculation Refinement** - Integrate all factors into accurate final dimensions
- [ ] **Phase 6: Validation & Testing** - Verify calculations against real-world cabinet scenarios

## Phase Details

### Phase 1: Material System
**Goal**: Create a material definition system with properties like thickness, name, and edge banding compatibility
**Depends on**: Nothing (first phase)
**Research**: Unlikely (internal data modeling)
**Plans**: TBD

### Phase 2: Part-Material Association
**Goal**: Allow parts to reference materials, enabling different materials for doors, shelves, carcass
**Depends on**: Phase 1
**Research**: Unlikely (extending existing patterns)
**Plans**: TBD

### Phase 3: Edge Banding Integration
**Goal**: Calculate part dimensions that correctly account for edge banding thickness on each edge
**Depends on**: Phase 2
**Research**: Likely (need real-world edge banding calculation patterns)
**Research topics**: Edge banding thickness standards, pre-edge vs post-edge cutting approaches, how professionals calculate cut dimensions with banding
**Plans**: TBD

### Phase 4: Joint/Connection System
**Goal**: Model joint types (dado, rabbet, butt, etc.) and calculate how they affect part dimensions
**Depends on**: Phase 3
**Research**: Likely (need to understand joint dimensional impacts)
**Research topics**: Common cabinet joint types, how each joint type affects mating part dimensions, standard joint depth/width conventions
**Plans**: TBD

### Phase 5: Measurement Calculation Refinement
**Goal**: Integrate material thickness, edge banding, and joint calculations into unified accurate dimensions
**Depends on**: Phase 4
**Research**: Unlikely (applying patterns from earlier research)
**Plans**: TBD

### Phase 6: Validation & Testing
**Goal**: Verify cut list accuracy against known cabinet configurations and real-world scenarios
**Depends on**: Phase 5
**Research**: Unlikely (testing against known scenarios)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Material System | 1/1 | Complete | 2026-01-15 |
| 2. Part-Material Association | 1/1 | Complete | 2026-01-15 |
| 3. Edge Banding Integration | 0/TBD | Not started | - |
| 4. Joint/Connection System | 0/TBD | Not started | - |
| 5. Measurement Calculation Refinement | 0/TBD | Not started | - |
| 6. Validation & Testing | 0/TBD | Not started | - |
