import type {
  CabinetPattern,
  CutPart,
  GlobalSettings,
  ExpressionContext,
  ExportOptions,
  RuleSet,
  Material,
} from '../types';

// ============================================
// Safe Expression Evaluator
// ============================================

/**
 * Safely evaluates arithmetic expressions with variable substitution.
 * Only allows basic math operations: +, -, *, /, (), and numbers.
 */
export function evaluateExpression(
  expression: string | number,
  context: ExpressionContext
): number {
  // If it's already a number, return it
  if (typeof expression === 'number') {
    return expression;
  }

  // Replace variable names with their values
  let processedExpr = expression.toLowerCase().trim();

  // Sort keys by length (longest first) to avoid partial replacements
  const sortedKeys = Object.keys(context).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const value = context[key];
    if (value !== undefined) {
      // Replace all occurrences of the variable
      const regex = new RegExp(key.replace(/_/g, '_'), 'gi');
      processedExpr = processedExpr.replace(regex, String(value));
    }
  }

  // Validate that only safe characters remain
  const safePattern = /^[\d\s+\-*/().]+$/;
  if (!safePattern.test(processedExpr)) {
    console.warn(`Unsafe expression detected: ${expression} -> ${processedExpr}`);
    return 0;
  }

  try {
    // Use Function constructor for safe evaluation (no access to scope)
    const result = new Function(`"use strict"; return (${processedExpr})`)();
    return typeof result === 'number' && !isNaN(result) ? Math.round(result * 100) / 100 : 0;
  } catch (error) {
    console.warn(`Expression evaluation failed: ${expression}`, error);
    return 0;
  }
}

// ============================================
// Expression Context Builder
// ============================================

/**
 * Builds the context object for expression evaluation
 */
export function buildExpressionContext(
  dimensions: { height: number; width: number; depth: number },
  settings: GlobalSettings,
  pattern: CabinetPattern,
  ruleSet?: RuleSet
): ExpressionContext {
  const { height, width, depth } = dimensions;
  const { backPanelGrooveDepth, defaultEdgeBanding } = settings;
  
  // Use pattern-specific material thicknesses if defined, otherwise fall back to global settings
  const materialThickness = pattern.materials?.carcass?.thickness ?? settings.materialThickness;
  const backPanelThickness = pattern.materials?.back?.thickness ?? settings.backPanelThickness;
  const frontThickness = pattern.materials?.front?.thickness ?? materialThickness;
  const shelfThickness = pattern.materials?.shelf?.thickness ?? materialThickness;

  // Count zone types
  // For column-based patterns, count zones from all columns
  let drawerCount = 0;
  let doorCount = 0;
  let shelfCount = 0;
  
  if (pattern.columns && pattern.columns.length > 0) {
    // Column-based pattern
    for (const column of pattern.columns) {
      drawerCount += column.zones.filter((z) => z.type === 'drawer').length;
      doorCount += column.zones.filter((z) => z.type === 'door').length;
      shelfCount += column.zones.filter((z) => z.type === 'shelf' || z.type === 'fixed-shelf').length;
    }
  } else {
    // Legacy flat zones pattern
    drawerCount = pattern.zones.filter((z) => z.type === 'drawer').length;
    doorCount = pattern.zones.filter((z) => z.type === 'door').length;
    shelfCount = pattern.zones.filter((z) => z.type === 'shelf' || z.type === 'fixed-shelf').length;
  }

  // Get construction method from ruleSet or use defaults
  const sideConstruction = ruleSet?.construction.sideConstruction || 'sides-on-bottom';
  const backPanelMethod = ruleSet?.construction.backPanelMethod || 'overlay';
  // drawerConstruction reserved for future drawer box calculations
  void ruleSet?.construction.drawerConstruction;

  // Calculate dimensions based on construction method
  // For "sides-on-bottom": sides are full height, bottom fits between sides
  // For "bottom-between-sides": bottom is full width, sides sit on top of bottom
  // For "all-between": all panels fit between each other (frame construction)
  
  let sideHeight: number;
  let bottomWidth: number;
  let topWidth: number;
  
  switch (sideConstruction) {
    case 'sides-on-bottom':
      // European style: sides full height, bottom between sides
      sideHeight = height;
      bottomWidth = width - 2 * materialThickness;
      topWidth = width - 2 * materialThickness;
      break;
    case 'bottom-between-sides':
      // American style: bottom full width, sides on top
      sideHeight = height - materialThickness; // Sides don't include bottom thickness
      bottomWidth = width;
      topWidth = width - 2 * materialThickness;
      break;
    case 'all-between':
      // Frame construction: all panels fit between
      sideHeight = height - 2 * materialThickness;
      bottomWidth = width - 2 * materialThickness;
      topWidth = width - 2 * materialThickness;
      break;
    default:
      sideHeight = height;
      bottomWidth = width - 2 * materialThickness;
      topWidth = width - 2 * materialThickness;
  }

  // Back panel dimensions based on method
  const backWidth = backPanelMethod === 'overlay' 
    ? width - 2 * materialThickness 
    : width - 2 * materialThickness - 2 * backPanelGrooveDepth;
  const backHeight = backPanelMethod === 'overlay'
    ? height - 2 * materialThickness
    : height - 2 * materialThickness - 2 * backPanelGrooveDepth;

  // RuleSet offsets
  const drawerFrontGap = ruleSet?.offsets.drawerFrontGap || 3;
  const doorGap = ruleSet?.offsets.doorGap || 3;
  const shelfInset = ruleSet?.offsets.shelfInset || 20;
  const drawerSlideOffset = ruleSet?.offsets.drawerSlideOffset || 12.5;

  // Build base context
  const context: ExpressionContext = {
    // Raw dimensions
    total_height: height,
    total_width: width,
    total_depth: depth,

    // Material properties (pattern-specific or global)
    material_thickness: materialThickness,
    thickness: materialThickness, // Alias for convenience
    carcass_thickness: materialThickness,
    front_thickness: frontThickness,
    shelf_thickness: shelfThickness,
    back_thickness: ruleSet?.offsets.backPanelThickness || backPanelThickness,
    back_groove: ruleSet?.offsets.backGrooveDepth || backPanelGrooveDepth,
    edge_banding: defaultEdgeBanding,

    // Construction-aware dimensions
    side_height: sideHeight,
    bottom_width: bottomWidth,
    top_width: topWidth,
    back_width: backWidth,
    back_height: backHeight,

    // Calculated internals
    internal_width: width - 2 * materialThickness,
    internal_height: height - 2 * materialThickness,
    internal_depth: depth - backPanelGrooveDepth,

    // RuleSet offsets
    drawer_front_gap: drawerFrontGap,
    door_gap: doorGap,
    shelf_inset: shelfInset,
    drawer_slide_offset: drawerSlideOffset,

    // Zone counts
    drawer_count: drawerCount,
    door_count: doorCount,
    shelf_count: shelfCount,

    // Remaining height (for dynamic zone calculations)
    remaining_height: height - 2 * materialThickness,
    
    // Column count (for column-based patterns)
    column_count: pattern.columns?.length || 1,
  };

  // Add column width variables (for column-based patterns)
  if (pattern.columns && pattern.columns.length > 0) {
    const internalWidth = width - 2 * materialThickness;
    const columnProportions = pattern.columnProportions || pattern.columns.map(() => 1 / pattern.columns!.length);
    
    pattern.columns.forEach((column, index) => {
      const proportion = columnProportions[index] || (1 / pattern.columns!.length);
      const colWidth = Math.round(internalWidth * proportion);
      // Add column widths as variables (e.g., column_0_width, column_1_width)
      context[`column_${index}_width`] = colWidth;
      // Also use column id if available
      context[`${column.id.replace(/-/g, '_')}_width`] = colWidth;
    });
  }

  // Add pattern-specific variables
  if (pattern.variables) {
    Object.entries(pattern.variables).forEach(([key, value]) => {
      context[key] = value;
    });
  }

  return context;
}

// ============================================
// Material Thickness Resolution
// ============================================

/**
 * Resolves material thickness from the materials library.
 *
 * @param materialId - The ID of the material to look up
 * @param materials - Array of available materials from the library
 * @param fallbackThickness - Value to return if material is not found
 * @returns The material's thickness, or fallbackThickness if not found
 */
export function getMaterialThickness(
  materialId: string | undefined,
  materials: Material[],
  fallbackThickness: number
): number {
  if (!materialId) return fallbackThickness;
  const material = materials.find((m) => m.id === materialId);
  return material?.thickness ?? fallbackThickness;
}

// ============================================
// Main Part Calculator
// ============================================

/**
 * Calculates all cut parts for a cabinet based on pattern rules and dimensions.
 * This is the core "logic engine" that processes pattern rules into concrete parts.
 * The ruleSet determines construction method and affects part dimensions.
 */
export function calculateParts(
  pattern: CabinetPattern,
  dimensions: { height: number; width: number; depth: number },
  globalSettings: GlobalSettings,
  variableOverrides?: Record<string, number>,
  zoneProportions?: number[],
  ruleSet?: RuleSet,
  materials?: Material[]
): CutPart[] {
  // Build expression context with ruleSet for construction-aware dimensions
  let context = buildExpressionContext(dimensions, globalSettings, pattern, ruleSet);

  // Apply any variable overrides
  if (variableOverrides) {
    context = { ...context, ...variableOverrides };
  }

  // Calculate zone-specific heights
  const internalHeight = dimensions.height - 2 * globalSettings.materialThickness;
  
  if (pattern.columns && pattern.columns.length > 0) {
    // Column-based pattern: add zone heights per column
    pattern.columns.forEach((column, colIdx) => {
      const colZoneProportions = column.zones.map(() => 1 / column.zones.length);
      column.zones.forEach((zone, zoneIdx) => {
        const zoneHeight = Math.round(internalHeight * colZoneProportions[zoneIdx]);
        // Add zone heights with column prefix (e.g., col_0_zone_0_height)
        context[`col_${colIdx}_zone_${zoneIdx}_height`] = zoneHeight;
        // Also use zone id if available
        context[`${zone.id.replace(/-/g, '_')}_height`] = zoneHeight;
      });
    });
  } else {
    // Legacy flat zones: use provided proportions or default to equal distribution
    const proportions = (zoneProportions && zoneProportions.length === pattern.zones.length)
      ? zoneProportions
      : pattern.zones.map(() => 1 / (pattern.zones.length || 1));

    if (pattern.zones.length > 0) {
      pattern.zones.forEach((zone, index) => {
        const zoneHeight = Math.round(internalHeight * proportions[index]);
        // Add zone heights as variables (e.g., zone_0_height, zone_1_height)
        context[`zone_${index}_height`] = zoneHeight;
        // Also use zone id if available
        context[`${zone.id.replace(/-/g, '_')}_height`] = zoneHeight;
      });
    }
  }

  const parts: CutPart[] = [];

  // Resolve materials array (fallback to empty array if not provided)
  const materialsList = materials ?? [];

  // Process each part rule
  for (const rule of pattern.partRules) {
    // Resolve material thickness for this part rule
    // If rule has materialId, use its thickness; otherwise use global material_thickness
    const resolvedMaterialId = rule.materialId;
    const partThickness = getMaterialThickness(
      resolvedMaterialId,
      materialsList,
      context.material_thickness
    );

    // Add part_thickness to context for this rule's expression evaluation
    const ruleContext = {
      ...context,
      part_thickness: partThickness,
    };

    const length = evaluateExpression(rule.lengthExpression, ruleContext);
    const width = evaluateExpression(rule.widthExpression, ruleContext);
    const quantity = Math.max(1, Math.round(evaluateExpression(rule.quantityExpression, ruleContext)));

    // Skip invalid parts
    if (length <= 0 || width <= 0) {
      console.warn(`Skipping invalid part: ${rule.partName} (L: ${length}, W: ${width})`);
      continue;
    }

    // Build edge banding string
    let edgeBanding = '';
    if (rule.edgeBanding) {
      const edges: string[] = [];
      if (rule.edgeBanding.length1) edges.push('L1');
      if (rule.edgeBanding.length2) edges.push('L2');
      if (rule.edgeBanding.width1) edges.push('W1');
      if (rule.edgeBanding.width2) edges.push('W2');
      edgeBanding = edges.join(', ');
    }

    parts.push({
      partName: rule.partName,
      length: Math.round(length),
      width: Math.round(width),
      quantity,
      materialId: resolvedMaterialId,
      material: rule.material,
      grain: rule.grain,
      edgeBanding: edgeBanding || undefined,
    });
  }

  return parts;
}

// ============================================
// Zone Height Calculator (for visualization)
// ============================================

/**
 * Calculates the pixel heights for each zone in a pattern
 */
export function calculateZoneHeights(
  pattern: CabinetPattern,
  dimensions: { height: number; width: number; depth: number },
  globalSettings: GlobalSettings
): { id: string; type: string; name: string; height: number }[] {
  const context = buildExpressionContext(dimensions, globalSettings, pattern);

  return pattern.zones.map((zone) => ({
    id: zone.id,
    type: zone.type,
    name: zone.name,
    height: evaluateExpression(zone.heightExpression, context),
  }));
}

// ============================================
// CSV Export Functions
// ============================================

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a CSV string from parts list
 * Format compatible with CutList Optimizer and similar tools
 */
export function generateCutListCSV(
  parts: CutPart[],
  options: ExportOptions = {
    includeEdgeBanding: true,
    groupByMaterial: false,
    includeLabels: true,
    includeHardware: false,
    includeCosts: false,
    format: 'cutlist-optimizer',
  }
): string {
  const lines: string[] = [];

  // Header row
  if (options.format === 'cutlist-optimizer') {
    // CutList Optimizer format: Name, Length, Width, Qty, [Material], [Grain]
    const headers = ['Name', 'Length', 'Width', 'Qty'];
    if (options.includeLabels) headers.push('Label');
    lines.push(headers.join(','));
  } else {
    // Generic CSV with more details
    const headers = ['Part Name', 'Length (mm)', 'Width (mm)', 'Quantity', 'Material', 'Grain', 'Edge Banding', 'Cabinet'];
    lines.push(headers.join(','));
  }

  // Sort/group parts if needed
  let sortedParts = [...parts];
  if (options.groupByMaterial) {
    sortedParts.sort((a, b) => (a.material || 'Main').localeCompare(b.material || 'Main'));
  }

  // Data rows
  for (const part of sortedParts) {
    if (options.format === 'cutlist-optimizer') {
      const row = [
        escapeCSV(part.partName),
        part.length,
        part.width,
        part.quantity,
      ];
      if (options.includeLabels && part.cabinetName) {
        row.push(escapeCSV(part.cabinetName));
      }
      lines.push(row.join(','));
    } else {
      lines.push(
        [
          escapeCSV(part.partName),
          part.length,
          part.width,
          part.quantity,
          escapeCSV(part.material || 'Main Material'),
          part.grain || 'none',
          options.includeEdgeBanding ? escapeCSV(part.edgeBanding || '') : '',
          escapeCSV(part.cabinetName || ''),
        ].join(',')
      );
    }
  }

  return lines.join('\n');
}

/**
 * Flattens all cabinets in a project into a single cut list
 */
export function flattenProjectToCutList(
  cabinets: { name: string; parts: CutPart[] }[]
): CutPart[] {
  const allParts: CutPart[] = [];

  for (const cabinet of cabinets) {
    for (const part of cabinet.parts) {
      allParts.push({
        ...part,
        cabinetName: cabinet.name,
      });
    }
  }

  return allParts;
}

/**
 * Consolidates duplicate parts (same dimensions and material)
 */
export function consolidateParts(parts: CutPart[]): CutPart[] {
  const consolidated = new Map<string, CutPart>();

  for (const part of parts) {
    const key = `${part.partName}|${part.length}|${part.width}|${part.material || 'main'}`;
    
    if (consolidated.has(key)) {
      const existing = consolidated.get(key)!;
      existing.quantity += part.quantity;
    } else {
      consolidated.set(key, { ...part });
    }
  }

  return Array.from(consolidated.values());
}

// ============================================
// Utility Functions
// ============================================

/**
 * Formats a dimension value with units
 */
export function formatDimension(value: number, units: 'mm' | 'inches' = 'mm'): string {
  if (units === 'inches') {
    return `${(value / 25.4).toFixed(2)}"`;
  }
  return `${value}mm`;
}

/**
 * Parses a dimension input, handling various formats
 */
export function parseDimension(input: string, units: 'mm' | 'inches' = 'mm'): number {
  const cleaned = input.replace(/[^\d.]/g, '');
  const value = parseFloat(cleaned);
  
  if (isNaN(value)) return 0;
  
  // If input contains inch indicators and we're in mm mode, convert
  if (units === 'mm' && (input.includes('"') || input.toLowerCase().includes('in'))) {
    return Math.round(value * 25.4);
  }
  
  return Math.round(value);
}

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
