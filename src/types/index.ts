// ============================================
// Core Type Definitions for Parametric Cabinet Generator
// ============================================

// ============================================
// MATERIALS & HARDWARE
// ============================================

/**
 * Material definition for the material library
 */
export interface Material {
  id: string;
  name: string;
  type: 'board' | 'edge-banding' | 'back-panel' | 'countertop' | 'mdf' | 'melamine' | 'plywood' | 'hdf' | 'solid-wood' | 'other';
  thickness: number; // in mm
  category?: string; // e.g., "MDF", "Plywood", "Melamine"
  color?: string; // hex color for visualization
  textureDirection?: 'horizontal' | 'vertical' | 'none';
  // Costing
  costPerM2?: number;
  pricePerM2?: number; // Alias for compatibility
  supplier?: string;
  supplierCode?: string;
  sku?: string;
  isAvailable?: boolean;
  // Properties
  properties?: {
    moistureResistant?: boolean;
    fireRated?: boolean;
    weight?: number; // kg/m²
  };
  // Edge banding specific properties
  edgeBandingWidth?: number; // Visible width of edge banding (e.g., 22mm, 45mm). Only for type 'edge-banding'.
  compatibleEdgeBandingIds?: string[]; // Edge banding material IDs compatible with this board. Only for board-type materials.
  matchesMaterialColor?: string; // Color/finish this banding matches (e.g., 'white', 'oak'). Only for type 'edge-banding'.
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hardware item definition
 */
export interface HardwareItem {
  id: string;
  name: string;
  type: 'hinge' | 'drawer-slide' | 'handle' | 'shelf-pin' | 'cam-lock' | 'dowel' | 'screw' | 'leg' | 'connector' | 'push-open' | 'soft-close' | 'other';
  category?: 'hinge' | 'slide' | 'handle' | 'shelf-pin' | 'connector' | 'screw' | 'leg' | 'accessory' | 'other';
  brand?: string;
  model?: string;
  sku?: string;
  // Specifications
  specifications?: {
    length?: number; // For drawer slides
    loadCapacity?: number; // kg
    openingAngle?: number; // For hinges
    color?: string;
    finish?: string;
  };
  // Costing
  costPerUnit: number;
  pricePerUnit?: number; // Alias for compatibility
  unitsPerPack?: number;
  supplier?: string;
  supplierCode?: string;
  isAvailable?: boolean;
  // Installation
  requiresPerUnit?: number; // e.g., 2 hinges per door
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Hardware usage rule - defines what hardware a zone/cabinet needs
 */
export interface HardwareRule {
  id: string;
  hardwareId: string;
  // Calculation for quantity
  quantityExpression: string; // e.g., "2" or "door_count * 2" or "ceil(zone_height / 500)"
  // Conditions
  condition?: {
    zoneType?: PatternZone['type'][];
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  };
}

// ============================================
// BACK PANEL OPTIONS
// ============================================

/**
 * Back panel configuration
 */
export interface BackPanelConfig {
  type: 'full-inset' | 'full-overlay' | 'rail-system' | 'none';
  materialId?: string;
  thickness?: number; // Override material thickness
  grooveDepth?: number;
  grooveFromEdge?: number; // Distance from edge
  // For rail system
  railWidth?: number;
  railPositions?: ('top' | 'bottom' | 'middle')[];
}

// ============================================
// ZONES & DIVISIONS
// ============================================

/**
 * Represents a column in a cabinet layout.
 * Columns divide the cabinet horizontally, each column contains its own vertical stack of zones.
 * 
 * Example: A 3-column wardrobe might have:
 * - Column 1 (30%): hanging space
 * - Column 2 (40%): shelves
 * - Column 3 (30%): drawers
 */
export interface PatternColumn {
  id: string;
  name: string;
  /** Width as percentage of internal cabinet width (0-100). All columns should sum to 100. */
  widthPercentage: number;
  /** Zones within this column, stacked vertically */
  zones: PatternZone[];
}

/**
 * Represents a zone within a cabinet (drawer, door, shelf, etc.)
 * Zones are stacked vertically within their column (or within the cabinet if no columns defined)
 * 
 * Layout model:
 * - Cabinet level: columns (horizontal divisions with adjustable widths)
 * - Column level: zones (vertical divisions within each column)
 * - Zones define the functional elements (drawers, doors, shelves, etc.)
 */
export interface PatternZone {
  id: string;
  type: 'drawer' | 'door' | 'shelf' | 'opening' | 'fixed-shelf' | 'appliance-space' | 'divider';
  name: string;
  // Size expressions
  heightExpression: string | number;
  // Calculated percentages (for proportional sizing within column)
  heightPercentage?: number;
  // Optional properties for specific zone types
  options?: {
    hasFront?: boolean;
    hasBack?: boolean;
    drawerSlideOffset?: number;
    doorOverlay?: number;
    hingeType?: 'left' | 'right' | 'double';
    // Material override
    materialId?: string;
    // Hardware override
    hardwarePreset?: string;
  };
}

/**
 * Inserted element/appliance that takes up space
 */
export interface InsertedElement {
  id: string;
  type: 'appliance' | 'sink' | 'hob' | 'oven' | 'microwave' | 'fridge' | 'dishwasher' | 'washer' | 'custom';
  name: string;
  brand?: string;
  model?: string;
  // Dimensions
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  // Position within cabinet (relative to internal space)
  position?: {
    fromTop?: number;
    fromBottom?: number;
    fromLeft?: number;
    fromRight?: number;
    centered?: boolean;
  };
  // Clearance requirements
  clearance?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    back?: number; // For ventilation
  };
  // Special requirements
  requirements?: {
    requiresVentilation?: boolean;
    requiresPlumbing?: boolean;
    requiresElectric?: boolean;
    requiresGas?: boolean;
    cutoutInCountertop?: boolean;
    cutoutDimensions?: { width: number; depth: number };
  };
  notes?: string;
}

// ============================================
// COUNTERTOP / WORKTOP
// ============================================

/**
 * Countertop definition
 */
export interface Countertop {
  id: string;
  name: string;
  materialId?: string;
  // Dimensions
  length: number;
  width: number; // Also known as depth
  depth: number; // Alias for width for backwards compatibility
  thickness: number;
  // Overhangs
  overhang: {
    front: number;
    back: number;
    left: number;
    right: number;
  };
  // Edge profiles
  edgeProfile?: {
    front?: 'square' | 'rounded' | 'beveled' | 'bullnose' | 'ogee';
    back?: 'square' | 'rounded' | 'beveled' | 'bullnose' | 'ogee';
    left?: 'square' | 'rounded' | 'beveled' | 'bullnose' | 'ogee';
    right?: 'square' | 'rounded' | 'beveled' | 'bullnose' | 'ogee';
  };
  // Cutouts for sinks, hobs, etc.
  cutouts?: CountertopCutout[];
  // Joints (for L-shaped or multiple pieces)
  joints?: CountertopJoint[];
  // Backsplash
  backsplash?: {
    height: number;
    thickness: number;
    materialId?: string;
  };
}

export interface CountertopCutout {
  id: string;
  type: 'sink' | 'hob' | 'tap-hole' | 'custom';
  shape: 'rectangle' | 'circle' | 'oval';
  // Position from front-left corner
  position: {
    fromLeft: number;
    fromFront: number;
  };
  // Dimensions
  dimensions: {
    width: number;
    depth: number;
    cornerRadius?: number;
  };
  // For circles
  diameter?: number;
  linkedElementId?: string; // Link to InsertedElement
}

export interface CountertopJoint {
  id: string;
  type: 'straight' | 'miter-left' | 'miter-right';
  position: number; // Distance from left edge
  angle?: number; // For miter joints
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validation rule definition
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'dimension' | 'structural' | 'hardware' | 'material' | 'safety';
  severity: 'error' | 'warning' | 'info';
  // Rule check
  check: ValidationCheck;
  message: string;
  // Conditions when this rule applies
  appliesTo?: {
    cabinetCategories?: CabinetPattern['category'][];
    zoneTypes?: PatternZone['type'][];
  };
}

export type ValidationCheck = 
  | { type: 'min-value'; field: string; value: number }
  | { type: 'max-value'; field: string; value: number }
  | { type: 'range'; field: string; min: number; max: number }
  | { type: 'ratio'; field1: string; field2: string; maxRatio: number }
  | { type: 'custom'; expression: string };

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  info: ValidationMessage[];
}

export interface ValidationMessage {
  ruleId?: string;
  ruleName: string;
  message: string;
  field?: string;
  value?: number;
  currentValue?: number;
  limit?: number;
  suggestedValue?: number;
  suggestion?: string;
}

// ============================================
// GLOBAL SETTINGS
// ============================================

/**
 * Global application settings
 */
export interface GlobalSettings {
  // Material defaults
  defaultMaterialId?: string;
  materialThickness: number;
  backPanelThickness: number;
  backPanelGrooveDepth: number;
  defaultEdgeBanding: number;
  // Construction
  drawerBottomInset: number;
  defaultBackPanelConfig?: BackPanelConfig;
  // Display
  units: 'mm' | 'inches';
  // Defaults
  defaultHardwarePresets?: Record<string, string>;
}

// ============================================
// PART RULES
// ============================================

/**
 * Part calculation rule for a pattern
 */
export interface PartRule {
  id: string;
  partName: string;
  lengthExpression: string;
  widthExpression: string;
  quantityExpression: string;
  // Material
  materialId?: string;
  material?: string;
  grain?: 'length' | 'width' | 'none';
  // Edge banding
  edgeBanding?: {
    length1?: boolean | string;
    length2?: boolean | string;
    width1?: boolean | string;
    width2?: boolean | string;
  };
  // Optional flags
  isOptional?: boolean;
  condition?: string;
}

// ============================================
// CABINET PATTERN
// ============================================

/**
 * Cabinet Pattern (Recipe/Template)
 */
export interface CabinetPattern {
  id: string;
  name: string;
  description: string;
  category: 'base' | 'wall' | 'tall' | 'drawer-unit' | 'corner' | 'custom';
  icon?: string;
  
  // Column-based structure (preferred for multi-column cabinets)
  // If columns is defined, zones within each column are used
  columns?: PatternColumn[];
  // Column width proportions for UI dragging (normalized 0-1, sum to 1)
  columnProportions?: number[];
  
  // Legacy/simple structure - single column cabinet
  // Used when columns is undefined or empty
  zones: PatternZone[];
  
  partRules: PartRule[];
  hardwareRules?: HardwareRule[];
  // Back panel
  backPanelConfig?: BackPanelConfig;
  // Defaults
  defaultDimensions: {
    height: number;
    width: number;
    depth: number;
  };
  defaultMaterialId?: string;
  
  // Pattern-specific material assignments with thicknesses
  // This allows each pattern to define what materials are used for each part
  materials?: {
    // Carcass/body material (sides, top, bottom, dividers)
    carcass?: {
      materialId: string;
      thickness: number; // Override material's default thickness if needed
    };
    // Back panel material
    back?: {
      materialId: string;
      thickness: number;
    };
    // Front material (doors, drawer fronts)
    front?: {
      materialId: string;
      thickness: number;
    };
    // Shelf material (if different from carcass)
    shelf?: {
      materialId: string;
      thickness: number;
    };
    // Edge banding material
    edgeBanding?: {
      materialId: string;
      thickness: number;
    };
  };
  
  // Pattern variables
  variables?: Record<string, number>;
  // Validation overrides
  validationOverrides?: Record<string, number>;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CUT PARTS
// ============================================

/**
 * Calculated part for the cut list
 */
export interface CutPart {
  partName: string;
  length: number;
  width: number;
  quantity: number;
  // Material
  materialId?: string;
  material?: string;
  grain?: 'length' | 'width' | 'none';
  // Edge banding
  edgeBanding?: string;
  edgeBandingDetails?: {
    length1?: string;
    length2?: string;
    width1?: string;
    width2?: string;
  };
  // Tracking
  cabinetId?: string;
  cabinetName?: string;
  zoneId?: string;
}

/**
 * Hardware requirement in cut list
 */
export interface HardwareRequirement {
  hardwareId: string;
  hardwareName: string;
  quantity: number;
  cabinetId?: string;
  cabinetName?: string;
  zoneId?: string;
  unitCost?: number;
  totalCost?: number;
}

// ============================================
// CABINET INSTANCE
// ============================================

/**
 * Cabinet Instance (Project Item)
 */
export interface CabinetInstance {
  id: string;
  name: string;
  patternId: string;
  // Dimensions
  dimensions: {
    height: number;
    width: number;
    depth: number;
  };
  // Materials
  materials?: {
    body?: string;
    front?: string;
    back?: string;
    edgeBanding?: string;
    thickness?: number;
  };
  // Back panel config
  backPanel?: BackPanelConfig;
  // Customization
  zoneProportions?: number[];
  columnProportions?: number[]; // For column-based patterns
  columnZoneProportions?: Record<string, number[]>; // Zone proportions per column (keyed by column id)
  zoneOverrides?: Record<string, Partial<PatternZone>>;
  variableOverrides?: Record<string, number>;
  materialOverrides?: Record<string, string>;
  // Inserted elements
  insertedElements?: InsertedElement[];
  // Back panel override
  backPanelConfig?: BackPanelConfig;
  // Hardware overrides
  hardwareOverrides?: Record<string, string>;
  // Position in room layout
  position?: {
    x: number;
    y: number;
    z?: number;
    rotation?: number;
  };
  // Cached calculations
  calculatedParts?: CutPart[];
  calculatedHardware?: HardwareRequirement[];
  // Metadata
  notes?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PROJECT
// ============================================

/**
 * Project containing multiple cabinet instances
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  // Cabinets
  cabinets: CabinetInstance[];
  // Countertops
  countertops?: Countertop[];
  // Room dimensions (for layout)
  roomDimensions?: {
    width: number;
    depth: number;
    height: number;
  };
  // Settings override
  globalSettingsOverride?: Partial<GlobalSettings>;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EXPRESSION CONTEXT
// ============================================

/**
 * Variables available for expression evaluation
 */
export interface ExpressionContext {
  // Cabinet dimensions
  total_height: number;
  total_width: number;
  total_depth: number;
  // Material
  material_thickness: number;
  back_thickness: number;
  back_groove: number;
  edge_banding: number;
  // Calculated helpers
  internal_width: number;
  internal_height: number;
  internal_depth: number;
  // Zone counts
  drawer_count?: number;
  door_count?: number;
  shelf_count?: number;
  remaining_height?: number;
  // Zone-specific
  zone_height?: number;
  zone_width?: number;
  zone_index?: number;
  // Custom variables
  [key: string]: number | undefined;
}

// ============================================
// UI STATE
// ============================================

export interface UIState {
  selectedCabinetId: string | null;
  isDarkMode: boolean;
  sidebarWidth: number;
  propertiesPanelWidth: number;
  isExporting: boolean;
  activeTab: 'project' | 'library' | 'settings' | 'materials' | 'hardware' | 'validation' | 'rules';
  // 3D preview state
  preview3D: {
    isOpen: boolean;
    cameraPosition?: { x: number; y: number; z: number };
    showDoors?: boolean;
    showDrawers?: boolean;
    showCountertop?: boolean;
    showGrid?: boolean;
    showDimensions?: boolean;
    showHardware?: boolean;
  };
  // Cut list modal state
  cutListModal: {
    isOpen: boolean;
    selectedRuleSetId?: string;
  };
}

// ============================================
// RULE SETS (Construction Rules)
// ============================================

/**
 * A rule set defines how cabinets are constructed
 */
export interface RuleSet {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  // Construction method
  construction: {
    // How sides connect to top/bottom
    sideConstruction: 'sides-on-bottom' | 'bottom-between-sides' | 'all-between';
    // Back panel method
    backPanelMethod: 'overlay' | 'inset-groove' | 'inset-rebate';
    // Drawer box construction
    drawerConstruction: 'sides-on-bottom' | 'bottom-in-groove';
  };
  // Material defaults
  materials: {
    carcassMaterialId?: string;
    frontMaterialId?: string;
    backMaterialId?: string;
    drawerMaterialId?: string;
    shelfMaterialId?: string;
  };
  // Dimensions and offsets (in mm)
  offsets: {
    drawerFrontGap: number; // Gap around drawer fronts (usually 2-4mm)
    doorGap: number; // Gap around doors
    shelfInset: number; // How much shelf is inset from front
    drawerSlideOffset: number; // Offset for drawer slides
    backPanelThickness: number;
    backGrooveDepth: number;
  };
  // Edge banding defaults
  edgeBanding: {
    carcassEdges: ('front' | 'back' | 'top' | 'bottom')[];
    shelfEdges: ('front' | 'back' | 'left' | 'right')[];
    doorEdges: ('all' | 'front-only')[];
    drawerFrontEdges: ('all' | 'front-only')[];
  };
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EXPORT OPTIONS
// ============================================

export interface ExportOptions {
  includeEdgeBanding: boolean;
  groupByMaterial: boolean;
  includeLabels: boolean;
  includeHardware: boolean;
  includeCosts: boolean;
  format: 'cutlist-optimizer' | 'generic-csv' | 'excel' | 'pdf';
}

// ============================================
// COSTING
// ============================================

export interface ProjectCost {
  materials: {
    materialId: string;
    materialName: string;
    area: number;
    unitCost: number;
    totalCost: number;
  }[];
  hardware: {
    hardwareId: string;
    hardwareName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  edgeBanding: {
    materialId: string;
    materialName: string;
    length: number;
    unitCost: number;
    totalCost: number;
  }[];
  countertops?: {
    countertopId: string;
    name: string;
    area: number;
    unitCost: number;
    totalCost: number;
  }[];
  labor?: number;
  markup?: number;
  subtotal: number;
  total: number;
}

// ============================================
// DEFAULT VALIDATION RULES
// ============================================

export const DEFAULT_VALIDATION_LIMITS = {
  drawer: {
    minWidth: 100,
    maxWidth: 9999, // Effectively no limit
    minHeight: 50,
    maxHeight: 9999,
    minDepth: 100,
    maxDepth: 9999,
  },
  door: {
    minWidth: 100,
    maxWidth: 9999,
    maxWidthDouble: 9999,
    minHeight: 100,
    maxHeight: 9999,
  },
  shelf: {
    minWidth: 100,
    maxWidth: 9999,
    minDepth: 100,
    maxSpanWithoutSupport: 9999,
  },
  cabinet: {
    minWidth: 100,
    maxWidth: 9999, // No max limit - user decides
    minHeight: 100,
    maxHeight: 9999, // No max limit - user decides
    minDepth: 100,
    maxDepth: 9999,
  },
  countertop: {
    minDepth: 100,
    maxDepth: 9999,
    minThickness: 3,
    maxThickness: 100,
    maxSpanWithoutSupport: 9999,
  },
} as const;
