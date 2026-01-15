import { useMemo, useState, useCallback, useRef } from 'react';
import type { CabinetPattern, CabinetInstance, GlobalSettings, PatternZone } from '../types';
import { ZoneEditModal } from './ZoneEditModal';

// ============================================
// Configuration Constants
// ============================================
const VISUALIZER_CONFIG = {
  // Layout
  padding: 40,
  maxWidth: 320,
  maxHeight: 420,
  maxScale: 0.5,
  
  // Zone constraints
  minZoneProportion: 0.08, // Minimum 8% per zone (allows more flexibility)
  minZoneHeightMm: 50,     // Absolute minimum zone height in mm
  
  // Visual elements
  shelfThickness: 8,       // Visual thickness of shelf in SVG
  dividerThickness: 6,     // Visual thickness of divider in SVG
  
  // Interaction
  dividerHitAreaHeight: 16, // Height of invisible hit area for dividers
  dragHandleWidth: 40,
  dragHandleHeight: 8,
} as const;

// Type for calculated zone with position data
interface CalculatedZone extends PatternZone {
  x: number;
  y: number;
  width: number;
  height: number;
  actualHeight: number;
  actualWidth?: number;
  proportion: number;
  level: number; // Nesting level
  columnIndex?: number;
  zoneIndex: number; // Index in the zones array
}

// Type for calculated column
interface CalculatedColumn {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  proportion: number;
  zones: CalculatedZone[];
}

interface CabinetVisualizerProps {
  pattern: CabinetPattern | null;
  cabinet: CabinetInstance | null;
  dimensions: {
    height: number;
    width: number;
    depth: number;
  };
  globalSettings: GlobalSettings;
  onZoneProportionsChange?: (proportions: number[]) => void;
  onZoneUpdate?: (zoneId: string, updates: Partial<PatternZone>) => void;
  className?: string;
}

export function CabinetVisualizer({
  pattern,
  cabinet,
  dimensions,
  globalSettings,
  onZoneProportionsChange,
  onZoneUpdate,
  className = '',
}: CabinetVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [editingZone, setEditingZone] = useState<CalculatedZone | null>(null);
  
  // Get zone proportions from cabinet or default to equal distribution
  const zoneProportions = useMemo(() => {
    if (!pattern) return [];
    const zoneCount = pattern.zones.length;
    if (cabinet?.zoneProportions && cabinet.zoneProportions.length === zoneCount) {
      return cabinet.zoneProportions;
    }
    // Default: equal proportions
    return Array(zoneCount).fill(1 / zoneCount);
  }, [pattern, cabinet?.zoneProportions]);

  // SVG dimensions and scaling - use config constants
  const { padding, maxWidth, maxHeight, maxScale } = VISUALIZER_CONFIG;

  // Safely get dimensions with defaults
  const cabinetWidth = dimensions?.width || 600;
  const cabinetHeight = dimensions?.height || 720;
  const materialThickness = globalSettings?.materialThickness || 18;
  
  // Real internal dimensions (in mm)
  const realInternalHeight = cabinetHeight - materialThickness * 2;
  const realInternalWidth = cabinetWidth - materialThickness * 2;

  // Calculate scale to fit cabinet in view
  const scaleX = (maxWidth - padding * 2) / cabinetWidth;
  const scaleY = (maxHeight - padding * 2) / cabinetHeight;
  const scale = Math.min(scaleX, scaleY, maxScale);

  const scaledWidth = cabinetWidth * scale;
  const scaledHeight = cabinetHeight * scale;
  const scaledThickness = materialThickness * scale;

  const svgWidth = scaledWidth + padding * 2;
  const svgHeight = scaledHeight + padding * 2;

  // Internal dimensions (inside the cabinet frame)
  const internalHeight = scaledHeight - scaledThickness * 2;
  const internalWidth = scaledWidth - scaledThickness * 2;
  const internalX = padding + scaledThickness;
  const internalY = padding + scaledThickness;

  // Handle drag start
  const handleDragStart = useCallback((dividerIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(dividerIndex);
  }, []);

  // Handle drag move - distributes change across ALL zones below the divider
  const handleDragMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging === null || !pattern) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Convert to proportion
    const relativeY = (y - internalY) / internalHeight;
    
    const { minZoneProportion } = VISUALIZER_CONFIG;
    const zoneCount = zoneProportions.length;
    const newProportions = [...zoneProportions];
    
    // Calculate cumulative proportion up to the current divider
    let cumulativeBefore = 0;
    for (let i = 0; i <= isDragging; i++) {
      cumulativeBefore += zoneProportions[i];
    }
    
    // Calculate bounds for the divider position
    const minDividerPos = minZoneProportion * (isDragging + 1);
    const maxDividerPos = 1 - minZoneProportion * (zoneCount - isDragging - 1);
    
    // Clamp the new divider position
    const newDividerPos = Math.max(minDividerPos, Math.min(maxDividerPos, relativeY));
    
    // Calculate how much the upper zone needs to change
    let cumulative = 0;
    for (let i = 0; i < isDragging; i++) {
      cumulative += newProportions[i];
    }
    
    const newUpperZone = newDividerPos - cumulative;
    const oldUpperZone = newProportions[isDragging];
    const diff = newUpperZone - oldUpperZone;
    
    // Validate the upper zone meets minimum
    if (newUpperZone < minZoneProportion) return;
    
    // Calculate total proportion available below the divider
    let totalBelow = 0;
    for (let i = isDragging + 1; i < zoneCount; i++) {
      totalBelow += newProportions[i];
    }
    
    // Check if we can distribute the change
    const newTotalBelow = totalBelow - diff;
    const zonesBelow = zoneCount - isDragging - 1;
    
    if (newTotalBelow < minZoneProportion * zonesBelow) return;
    
    // Apply change to upper zone
    newProportions[isDragging] = newUpperZone;
    
    // Distribute the difference proportionally among ALL zones below
    // This is the key change - instead of just affecting the adjacent zone,
    // we distribute the change proportionally to all zones below
    if (totalBelow > 0) {
      for (let i = isDragging + 1; i < zoneCount; i++) {
        // Scale each zone's proportion based on its share of the total below
        const shareOfBelow = newProportions[i] / totalBelow;
        newProportions[i] = Math.max(minZoneProportion, newTotalBelow * shareOfBelow);
      }
    }
    
    // Normalize to ensure they sum to 1
    const sum = newProportions.reduce((a, b) => a + b, 0);
    const normalized = newProportions.map(p => p / sum);
    
    onZoneProportionsChange?.(normalized);
  }, [isDragging, pattern, zoneProportions, internalHeight, internalY, onZoneProportionsChange]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Handle double-click on zone to open edit modal
  const handleZoneDoubleClick = useCallback((zone: CalculatedZone) => {
    setEditingZone(zone);
  }, []);

  // Handle height change from modal (converts mm to proportion)
  const handleZoneHeightChange = useCallback((newHeightMm: number) => {
    if (!editingZone || !pattern) return;
    
    const newProportion = newHeightMm / realInternalHeight;
    const zoneIndex = editingZone.zoneIndex;
    const newProportions = [...zoneProportions];
    const oldProportion = newProportions[zoneIndex];
    const diff = newProportion - oldProportion;
    
    // Calculate total proportion of zones below this one
    let totalBelow = 0;
    for (let i = zoneIndex + 1; i < newProportions.length; i++) {
      totalBelow += newProportions[i];
    }
    
    const { minZoneProportion } = VISUALIZER_CONFIG;
    const zonesBelow = newProportions.length - zoneIndex - 1;
    
    // If there are zones below, distribute the change among them
    if (zonesBelow > 0 && totalBelow > 0) {
      const newTotalBelow = totalBelow - diff;
      
      // Check if we can make this change
      if (newTotalBelow < minZoneProportion * zonesBelow) return;
      if (newProportion < minZoneProportion) return;
      
      newProportions[zoneIndex] = newProportion;
      
      // Distribute proportionally among zones below
      for (let i = zoneIndex + 1; i < newProportions.length; i++) {
        const shareOfBelow = newProportions[i] / totalBelow;
        newProportions[i] = Math.max(minZoneProportion, newTotalBelow * shareOfBelow);
      }
    } else if (zoneIndex === newProportions.length - 1) {
      // Last zone - take from zones above proportionally
      let totalAbove = 0;
      for (let i = 0; i < zoneIndex; i++) {
        totalAbove += newProportions[i];
      }
      
      const newTotalAbove = totalAbove - diff;
      if (newTotalAbove < minZoneProportion * zoneIndex) return;
      
      newProportions[zoneIndex] = newProportion;
      
      for (let i = 0; i < zoneIndex; i++) {
        const shareOfAbove = newProportions[i] / totalAbove;
        newProportions[i] = Math.max(minZoneProportion, newTotalAbove * shareOfAbove);
      }
    }
    
    // Normalize
    const sum = newProportions.reduce((a, b) => a + b, 0);
    const normalized = newProportions.map(p => p / sum);
    
    onZoneProportionsChange?.(normalized);
  }, [editingZone, pattern, zoneProportions, realInternalHeight, onZoneProportionsChange]);

  // Check if pattern uses new column-based structure
  const hasColumns = pattern?.columns && pattern.columns.length > 0;
  
  // Calculate column proportions
  const columnProportions = useMemo(() => {
    if (!pattern?.columns || pattern.columns.length === 0) return [];
    if (pattern.columnProportions && pattern.columnProportions.length === pattern.columns.length) {
      return pattern.columnProportions;
    }
    // Default: equal proportions
    return Array(pattern.columns.length).fill(1 / pattern.columns.length);
  }, [pattern?.columns, pattern?.columnProportions]);

  // Calculate columns with zones
  const calculatedColumns = useMemo((): CalculatedColumn[] => {
    if (!pattern?.columns || pattern.columns.length === 0) return [];
    
    const columns: CalculatedColumn[] = [];
    let currentX = internalX;
    
    for (let colIdx = 0; colIdx < pattern.columns.length; colIdx++) {
      const column = pattern.columns[colIdx];
      const colProportion = columnProportions[colIdx] || (1 / pattern.columns.length);
      const colWidth = internalWidth * colProportion;
      
      // Get zone proportions for this column from cabinet instance
      const columnZoneProportions = cabinet?.columnZoneProportions?.[column.id] 
        || column.zones.map(() => 1 / column.zones.length);
      
      // Calculate zones within this column
      const calculatedZones: CalculatedZone[] = [];
      let currentY = internalY;
      
      for (let zoneIdx = 0; zoneIdx < column.zones.length; zoneIdx++) {
        const zone = column.zones[zoneIdx];
        const zoneProportion = columnZoneProportions[zoneIdx] || (1 / column.zones.length);
        const zoneHeight = internalHeight * zoneProportion;
        
        calculatedZones.push({
          ...zone,
          x: currentX,
          y: currentY,
          width: colWidth,
          height: zoneHeight,
          actualHeight: Math.round((cabinetHeight - materialThickness * 2) * zoneProportion),
          actualWidth: Math.round((cabinetWidth - materialThickness * 2) * colProportion),
          proportion: zoneProportion,
          level: 0,
          columnIndex: colIdx,
          zoneIndex: zoneIdx,
        });
        
        currentY += zoneHeight;
      }
      
      columns.push({
        id: column.id,
        x: currentX,
        y: internalY,
        width: colWidth,
        height: internalHeight,
        proportion: colProportion,
        zones: calculatedZones,
      });
      
      currentX += colWidth;
    }
    
    return columns;
  }, [pattern?.columns, columnProportions, cabinet?.columnZoneProportions, internalX, internalY, internalWidth, internalHeight, cabinetWidth, cabinetHeight, materialThickness]);

  // Calculate zone positions - legacy support for non-column patterns
  const zones = useMemo((): CalculatedZone[] => {
    // If using columns, flatten all column zones
    if (hasColumns && calculatedColumns.length > 0) {
      return calculatedColumns.flatMap(col => col.zones);
    }
    
    // Legacy support
    if (!pattern || !pattern.zones || pattern.zones.length === 0) return [];
    if (!zoneProportions || zoneProportions.length === 0) return [];
    
    const result: CalculatedZone[] = [];
    let currentY = internalY;
    
    for (let i = 0; i < pattern.zones.length; i++) {
      const zone = pattern.zones[i];
      const proportion = zoneProportions[i] || (1 / pattern.zones.length);
      const height = internalHeight * proportion;
      
      result.push({
        ...zone,
        x: internalX,
        y: currentY,
        width: internalWidth,
        height,
        actualHeight: Math.round((cabinetHeight - materialThickness * 2) * proportion),
        proportion,
        level: 0,
        zoneIndex: i,
      });
      
      currentY += height;
    }
    
    return result;
  }, [hasColumns, calculatedColumns, pattern, zoneProportions, internalX, internalY, internalWidth, internalHeight, cabinetWidth, cabinetHeight, materialThickness]);

  // Empty state
  if (!pattern) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-sm">Selecione um armário</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`cabinet-visualizer-container flex flex-col items-center justify-center h-full ${className}`}>
      {/* Cabinet info */}
      <div className="text-center mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {pattern.name}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {dimensions.width} × {dimensions.height} × {dimensions.depth} mm
        </p>
      </div>

      {/* SVG Visualization */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className={`cabinet-visualizer-svg select-none ${isDragging !== null ? 'cursor-row-resize' : ''}`}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Cabinet outer frame */}
        <rect
          x={padding}
          y={padding}
          width={scaledWidth}
          height={scaledHeight}
          fill="#d1d5db"
          stroke="#9ca3af"
          strokeWidth={1}
          className="dark:fill-gray-600 dark:stroke-gray-500"
        />

        {/* Cabinet internal area */}
        <rect
          x={internalX}
          y={internalY}
          width={internalWidth}
          height={internalHeight}
          fill="#f9fafb"
          className="dark:fill-gray-800"
        />

        {/* Render zones */}
        {zones.map((zone) => {
          const isDrawer = zone.type === 'drawer';
          const isDoor = zone.type === 'door';
          const isDivider = zone.type === 'divider';
          const isDoubleDoor = isDoor && zone.options?.hingeType === 'double';
          const hingeRight = isDoor && zone.options?.hingeType === 'right';
          const isShelf = zone.type === 'shelf' || zone.type === 'fixed-shelf';
          const isOpening = zone.type === 'opening';
          
          // Zone colors based on type
          const fillColor = isDrawer ? '#fef3c7' : isDoor ? '#dbeafe' : isShelf || isOpening ? 'transparent' : '#ffffff';
          
          // Visual thickness from config
          const { shelfThickness, dividerThickness } = VISUALIZER_CONFIG;
          
          return (
            <g 
              key={zone.id}
              className="cursor-pointer"
              onDoubleClick={() => handleZoneDoubleClick(zone)}
            >
              {/* Invisible hit area for double-click */}
              <rect
                x={zone.x}
                y={zone.y}
                width={zone.width}
                height={zone.height}
                fill="transparent"
                className="hover:fill-blue-500/5"
              />
              
              {/* Divider visualization - vertical panel */}
              {isDivider && (
                <>
                  {/* The divider occupies its zone height but renders as a vertical panel */}
                  {/* Open space for the zone */}
                  <rect
                    x={zone.x + 1}
                    y={zone.y + 1}
                    width={zone.width - 2}
                    height={zone.height - 2}
                    fill="#f9fafb"
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray="4,2"
                    className="dark:fill-gray-800 dark:stroke-gray-600"
                  />
                  {/* Vertical divider panel in the middle */}
                  <rect
                    x={zone.x + zone.width / 2 - dividerThickness / 2}
                    y={zone.y + 1}
                    width={dividerThickness}
                    height={zone.height - 2}
                    fill="#d4a574"
                    stroke="#a3785a"
                    strokeWidth={1}
                    className="dark:fill-amber-700 dark:stroke-amber-600"
                  />
                  {/* Wood grain lines on divider */}
                  <line
                    x1={zone.x + zone.width / 2}
                    y1={zone.y + 5}
                    x2={zone.x + zone.width / 2}
                    y2={zone.y + zone.height - 5}
                    stroke="#b8956c"
                    strokeWidth={0.5}
                    opacity={0.4}
                    className="dark:stroke-amber-500"
                  />
                </>
              )}

              {/* Zone rectangle - for non-shelf, non-divider zones */}
              {!isShelf && !isOpening && !isDivider && (
                <rect
                  x={zone.x + 1}
                  y={zone.y + 1}
                  width={zone.width - 2}
                  height={zone.height - 2}
                  fill={fillColor}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  className="dark:stroke-gray-600"
                />
              )}

              {/* Shelf visualization - wooden slab at bottom of zone with open space above */}
              {isShelf && (
                <>
                  {/* Open space above shelf */}
                  <rect
                    x={zone.x + 1}
                    y={zone.y + 1}
                    width={zone.width - 2}
                    height={zone.height - shelfThickness - 2}
                    fill="#f9fafb"
                    stroke="#e5e7eb"
                    strokeWidth={1}
                    strokeDasharray="4,2"
                    className="dark:fill-gray-800 dark:stroke-gray-600"
                  />
                  {/* Shelf wood slab */}
                  <rect
                    x={zone.x + 1}
                    y={zone.y + zone.height - shelfThickness}
                    width={zone.width - 2}
                    height={shelfThickness}
                    fill="#d4a574"
                    stroke="#a3785a"
                    strokeWidth={1}
                    className="dark:fill-amber-700 dark:stroke-amber-600"
                  />
                  {/* Wood grain texture lines */}
                  <line
                    x1={zone.x + 5}
                    y1={zone.y + zone.height - shelfThickness / 2}
                    x2={zone.x + zone.width - 5}
                    y2={zone.y + zone.height - shelfThickness / 2}
                    stroke="#b8956c"
                    strokeWidth={0.5}
                    opacity={0.4}
                    className="dark:stroke-amber-500"
                  />
                </>
              )}

              {/* Opening visualization - empty space with dashed border */}
              {isOpening && (
                <rect
                  x={zone.x + 1}
                  y={zone.y + 1}
                  width={zone.width - 2}
                  height={zone.height - 2}
                  fill="#f9fafb"
                  stroke="#9ca3af"
                  strokeWidth={1}
                  strokeDasharray="4,2"
                  className="dark:fill-gray-800 dark:stroke-gray-500"
                />
              )}

              {/* Door visualization - single door */}
              {isDoor && !isDoubleDoor && (
                <>
                  <line
                    x1={hingeRight ? zone.x + zone.width - 4 : zone.x + 4}
                    y1={zone.y + 4}
                    x2={hingeRight ? zone.x + 4 : zone.x + zone.width - 4}
                    y2={zone.y + zone.height / 2}
                    stroke="#93c5fd"
                    strokeWidth={1}
                    strokeDasharray="3,2"
                  />
                  <line
                    x1={hingeRight ? zone.x + zone.width - 4 : zone.x + 4}
                    y1={zone.y + zone.height - 4}
                    x2={hingeRight ? zone.x + 4 : zone.x + zone.width - 4}
                    y2={zone.y + zone.height / 2}
                    stroke="#93c5fd"
                    strokeWidth={1}
                    strokeDasharray="3,2"
                  />
                  <circle cx={hingeRight ? zone.x + zone.width - 6 : zone.x + 6} cy={zone.y + zone.height / 2} r={3} fill="#3b82f6" />
                </>
              )}
              
              {/* Door visualization - double door */}
              {isDoubleDoor && (
                <>
                  <line x1={zone.x + zone.width / 2} y1={zone.y + 4} x2={zone.x + zone.width / 2} y2={zone.y + zone.height - 4} stroke="#93c5fd" strokeWidth={1} strokeDasharray="3,2" />
                  <line x1={zone.x + 4} y1={zone.y + 4} x2={zone.x + zone.width / 2 - 4} y2={zone.y + zone.height / 2} stroke="#93c5fd" strokeWidth={1} strokeDasharray="2,2" />
                  <line x1={zone.x + zone.width - 4} y1={zone.y + 4} x2={zone.x + zone.width / 2 + 4} y2={zone.y + zone.height / 2} stroke="#93c5fd" strokeWidth={1} strokeDasharray="2,2" />
                  <circle cx={zone.x + 6} cy={zone.y + zone.height / 2} r={2} fill="#3b82f6" />
                  <circle cx={zone.x + zone.width - 6} cy={zone.y + zone.height / 2} r={2} fill="#3b82f6" />
                </>
              )}

              {/* Drawer handle */}
              {isDrawer && (
                <rect x={zone.x + zone.width / 2 - 15} y={zone.y + zone.height / 2 - 2} width={30} height={4} rx={2} fill="#d97706" opacity={0.5} />
              )}

              {/* Zone content */}
              <text
                x={zone.x + zone.width / 2}
                y={zone.y + zone.height / 2 - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-600 dark:fill-gray-300 pointer-events-none"
                style={{ fontSize: '11px', fontWeight: 500 }}
              >
                {zone.name}
              </text>

              {/* Height and percentage */}
              <text
                x={zone.x + zone.width / 2}
                y={zone.y + zone.height / 2 + 8}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-gray-400 dark:fill-gray-500 pointer-events-none"
                style={{ fontSize: '10px' }}
              >
                {zone.actualHeight}mm ({Math.round(zone.proportion * 100)}%)
              </text>
            </g>
          );
        })}

        {/* Draggable zone dividers */}
        {zones.slice(0, -1).map((zone, index) => {
          // Only show dividers between zones in the same column
          const nextZone = zones[index + 1];
          if (!nextZone || zone.columnIndex !== nextZone.columnIndex) return null;
          
          const dividerY = zone.y + zone.height;
          const isActive = isDragging === index;
          
          return (
            <g key={`divider-${index}`}>
              {/* Invisible wider hit area */}
              <rect
                x={zone.x}
                y={dividerY - 8}
                width={zone.width}
                height={16}
                fill="transparent"
                className="cursor-row-resize"
                onMouseDown={(e) => handleDragStart(index, e)}
              />
              
              {/* Visual divider */}
              <line
                x1={zone.x}
                y1={dividerY}
                x2={zone.x + zone.width}
                y2={dividerY}
                stroke={isActive ? '#3b82f6' : '#d1d5db'}
                strokeWidth={isActive ? 2 : 1}
                className="pointer-events-none dark:stroke-gray-500"
              />
              
              {/* Drag handle */}
              <rect
                x={zone.x + zone.width / 2 - 20}
                y={dividerY - 4}
                width={40}
                height={8}
                fill={isActive ? '#3b82f6' : '#9ca3af'}
                rx={4}
                className="pointer-events-none cursor-row-resize"
                opacity={isActive ? 1 : 0.6}
              />
              
              {/* Grip dots */}
              <circle cx={zone.x + zone.width / 2 - 8} cy={dividerY} r={1.5} fill="white" className="pointer-events-none" />
              <circle cx={zone.x + zone.width / 2} cy={dividerY} r={1.5} fill="white" className="pointer-events-none" />
              <circle cx={zone.x + zone.width / 2 + 8} cy={dividerY} r={1.5} fill="white" className="pointer-events-none" />
            </g>
          );
        })}

        {/* Column dividers (vertical) */}
        {calculatedColumns.slice(0, -1).map((col, index) => {
          const dividerX = col.x + col.width;
          const colWidthMm = Math.round((cabinetWidth - materialThickness * 2) * col.proportion);
          
          return (
            <g key={`col-divider-${index}`}>
              {/* Column divider panel */}
              <line
                x1={dividerX}
                y1={internalY}
                x2={dividerX}
                y2={internalY + internalHeight}
                stroke="#d4a574"
                strokeWidth={3}
                className="dark:stroke-amber-600"
              />
              {/* Column width label */}
              <text
                x={col.x + col.width / 2}
                y={internalY - 5}
                textAnchor="middle"
                className="fill-gray-500 dark:fill-gray-400 pointer-events-none"
                style={{ fontSize: '9px' }}
              >
                {colWidthMm}mm
              </text>
            </g>
          );
        })}

        {/* Dimension annotations */}
        {/* Width */}
        <g>
          <line x1={padding} y1={svgHeight - 12} x2={padding + scaledWidth} y2={svgHeight - 12} stroke="#9ca3af" strokeWidth={1} />
          <line x1={padding} y1={svgHeight - 16} x2={padding} y2={svgHeight - 8} stroke="#9ca3af" strokeWidth={1} />
          <line x1={padding + scaledWidth} y1={svgHeight - 16} x2={padding + scaledWidth} y2={svgHeight - 8} stroke="#9ca3af" strokeWidth={1} />
          <text x={padding + scaledWidth / 2} y={svgHeight - 2} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" style={{ fontSize: '10px' }}>
            {dimensions.width}mm
          </text>
        </g>

        {/* Height */}
        <g>
          <line x1={12} y1={padding} x2={12} y2={padding + scaledHeight} stroke="#9ca3af" strokeWidth={1} />
          <line x1={8} y1={padding} x2={16} y2={padding} stroke="#9ca3af" strokeWidth={1} />
          <line x1={8} y1={padding + scaledHeight} x2={16} y2={padding + scaledHeight} stroke="#9ca3af" strokeWidth={1} />
          <text x={8} y={padding + scaledHeight / 2} textAnchor="middle" transform={`rotate(-90, 8, ${padding + scaledHeight / 2})`} className="fill-gray-500 dark:fill-gray-400" style={{ fontSize: '10px' }}>
            {dimensions.height}mm
          </text>
        </g>
      </svg>

      {/* Help text */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Arraste divisores ou dê duplo-clique para editar
      </p>

      {/* Zone Edit Modal */}
      <ZoneEditModal
        isOpen={editingZone !== null}
        zone={editingZone}
        actualHeight={editingZone?.actualHeight ?? 0}
        actualWidth={editingZone?.actualWidth}
        proportion={editingZone?.proportion ?? 0}
        totalInternalHeight={realInternalHeight}
        totalInternalWidth={realInternalWidth}
        globalSettings={globalSettings}
        onClose={() => setEditingZone(null)}
        onHeightChange={handleZoneHeightChange}
        onZoneUpdate={onZoneUpdate ? (updates) => onZoneUpdate(editingZone!.id, updates) : undefined}
      />
    </div>
  );
}
