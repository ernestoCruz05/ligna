import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Trash2, Save, X, Box, Layers, Square, ArrowDown, RotateCw, Settings, ChevronUp, ChevronDown, Refrigerator, Columns, Plus, GripVertical } from 'lucide-react';
import { cn } from '../utils/cn';
import { useCabinetStore } from '../store/cabinetStore';
import type { CabinetPattern, PatternZone, PartRule, PatternColumn } from '../types';
import { pt } from '../i18n/pt';

interface PatternEditorProps {
  pattern?: CabinetPattern;
  onSave: (pattern: CabinetPattern) => void;
  onCancel: () => void;
  className?: string;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Generate part rules from columns (or zones for single-column)
function generatePartRules(columns: PatternColumn[], columnProportions: number[]): PartRule[] {
  // Base cabinet construction (European style):
  // - Sides fit BETWEEN top and bottom panels
  // - Top panel is between sides horizontally
  // - Bottom panel is between sides horizontally  
  // - Back panel OVERLAYS the back (covers full back)
  const rules: PartRule[] = [
    // Side panels - height minus top and bottom panel thicknesses (sides between top/bottom)
    { 
      id: generateId(), 
      partName: 'Lateral', 
      lengthExpression: 'total_height - 2 * material_thickness',
      widthExpression: 'total_depth - back_thickness',
      quantityExpression: '2', 
      material: 'MDF', 
      grain: 'length', 
      edgeBanding: { length1: true, length2: false, width1: false, width2: true } 
    },
    // Bottom panel - between sides
    { 
      id: generateId(), 
      partName: 'Base', 
      lengthExpression: 'total_width - 2 * material_thickness', 
      widthExpression: 'total_depth - back_thickness', 
      quantityExpression: '1', 
      material: 'MDF', 
      grain: 'length', 
      edgeBanding: { length1: true, length2: false, width1: false, width2: false } 
    },
    // Top panel - between sides
    { 
      id: generateId(), 
      partName: 'Topo', 
      lengthExpression: 'total_width - 2 * material_thickness', 
      widthExpression: 'total_depth - back_thickness', 
      quantityExpression: '1', 
      material: 'MDF', 
      grain: 'length', 
      edgeBanding: { length1: true, length2: false, width1: false, width2: false } 
    },
    // Back panel - FULL OVERLAY (covers entire back)
    { 
      id: generateId(), 
      partName: 'Traseira', 
      lengthExpression: 'total_width', 
      widthExpression: 'total_height', 
      quantityExpression: '1', 
      material: 'HDF 3mm', 
      grain: 'none' 
    },
  ];

  // Add vertical dividers between columns (if more than 1 column)
  if (columns.length > 1) {
    for (let i = 0; i < columns.length - 1; i++) {
      rules.push({
        id: generateId(),
        partName: `Divisória Vertical ${i + 1}`,
        lengthExpression: 'total_height - 2 * material_thickness',
        widthExpression: 'total_depth - back_thickness',
        quantityExpression: '1',
        material: 'MDF',
        grain: 'length',
        edgeBanding: { length1: true, length2: true, width1: false, width2: false }
      });
    }
  }

  // Process zones in each column
  let globalDrawerCount = 0, globalDoorCount = 0, globalShelfCount = 0;

  columns.forEach((column, colIdx) => {
    const colWidthExpr = columns.length > 1 
      ? `(total_width - 2 * material_thickness - ${columns.length - 1} * material_thickness) * ${columnProportions[colIdx] || 1 / columns.length}`
      : 'total_width - 2 * material_thickness';

    column.zones.forEach((zone, zoneIdx) => {
      const isDoubleDoor = zone.options?.hingeType === 'double';
      const zoneHeightExpr = `col_${colIdx}_zone_${zoneIdx}_height`;
      
      switch (zone.type) {
        case 'drawer':
          globalDrawerCount++;
          rules.push(
            // Drawer front (decorative)
            { 
              id: generateId(), 
              partName: `Frente Gaveta ${globalDrawerCount}`, 
              lengthExpression: `${colWidthExpr} - 4`, 
              widthExpression: `${zoneHeightExpr} - 3`, 
              quantityExpression: '1', 
              material: 'MDF', 
              grain: 'width', 
              edgeBanding: { length1: true, length2: true, width1: true, width2: true } 
            },
            // Drawer box sides (2x)
            { 
              id: generateId(), 
              partName: `Ilharga Gaveta ${globalDrawerCount}`, 
              lengthExpression: 'total_depth - 60', 
              widthExpression: `${zoneHeightExpr} - 40`, 
              quantityExpression: '2', 
              material: 'MDF', 
              grain: 'length' 
            },
            // Drawer box front (inner structural front)
            { 
              id: generateId(), 
              partName: `Testa Gaveta ${globalDrawerCount}`, 
              lengthExpression: `${colWidthExpr} - 90`, 
              widthExpression: `${zoneHeightExpr} - 40`, 
              quantityExpression: '1', 
              material: 'MDF', 
              grain: 'length' 
            },
            // Drawer box back
            { 
              id: generateId(), 
              partName: `Costas Gaveta ${globalDrawerCount}`, 
              lengthExpression: `${colWidthExpr} - 90`, 
              widthExpression: `${zoneHeightExpr} - 40`, 
              quantityExpression: '1', 
              material: 'MDF', 
              grain: 'length' 
            },
            // Drawer bottom
            { 
              id: generateId(), 
              partName: `Fundo Gaveta ${globalDrawerCount}`, 
              lengthExpression: `${colWidthExpr} - 86`, 
              widthExpression: 'total_depth - 70', 
              quantityExpression: '1', 
              material: 'HDF 3mm', 
              grain: 'none' 
            }
          );
          break;
        case 'door':
          globalDoorCount++;
          if (isDoubleDoor) {
            rules.push({ 
              id: generateId(), 
              partName: `Porta ${globalDoorCount}`, 
              lengthExpression: `(${colWidthExpr} - 4) / 2 - 2`, 
              widthExpression: `${zoneHeightExpr} - 3`, 
              quantityExpression: '2', 
              material: 'MDF', 
              grain: 'width', 
              edgeBanding: { length1: true, length2: true, width1: true, width2: true } 
            });
          } else {
            rules.push({ 
              id: generateId(), 
              partName: `Porta ${globalDoorCount}`, 
              lengthExpression: `${colWidthExpr} - 4`, 
              widthExpression: `${zoneHeightExpr} - 3`, 
              quantityExpression: '1', 
              material: 'MDF', 
              grain: 'width', 
              edgeBanding: { length1: true, length2: true, width1: true, width2: true } 
            });
          }
          break;
        case 'shelf':
        case 'fixed-shelf':
          globalShelfCount++;
          rules.push({ 
            id: generateId(), 
            partName: `Prateleira ${globalShelfCount}`, 
            lengthExpression: `${colWidthExpr} - 2`, 
            widthExpression: 'total_depth - back_thickness - 20', 
            quantityExpression: '1', 
            material: 'MDF', 
            grain: 'length', 
            edgeBanding: { length1: true, length2: false, width1: false, width2: false } 
          });
          break;
        case 'appliance-space':
        case 'opening':
          // No parts generated
          break;
      }
    });
  });

  return rules;
}

export function PatternEditor({ pattern, onSave, onCancel, className }: PatternEditorProps) {
  const { globalSettings, materials } = useCabinetStore();
  
  // State - Column-based architecture
  const [name, setName] = useState(pattern?.name || '');
  const [description, setDescription] = useState(pattern?.description || '');
  const [category, setCategory] = useState<CabinetPattern['category']>(pattern?.category || 'custom');
  const [dimensions, setDimensions] = useState(pattern?.defaultDimensions || { height: 720, width: 600, depth: 560 });
  const [showSettings, setShowSettings] = useState(false);
  
  // Pattern materials configuration
  const [patternMaterials, setPatternMaterials] = useState<CabinetPattern['materials']>(pattern?.materials || {
    carcass: { materialId: '', thickness: globalSettings.materialThickness },
    back: { materialId: '', thickness: globalSettings.backPanelThickness },
    front: { materialId: '', thickness: globalSettings.materialThickness },
  });
  
  // Columns state - convert legacy zones to single column if needed
  const [columns, setColumns] = useState<PatternColumn[]>(() => {
    if (pattern?.columns && pattern.columns.length > 0) {
      return pattern.columns;
    }
    // Legacy: convert zones to single column
    if (pattern?.zones && pattern.zones.length > 0) {
      return [{
        id: generateId(),
        name: 'Coluna 1',
        widthPercentage: 100,
        zones: pattern.zones
      }];
    }
    // Default: single empty column
    return [{
      id: generateId(),
      name: 'Coluna 1',
      widthPercentage: 100,
      zones: []
    }];
  });
  
  // Column proportions (for dragging column dividers)
  const [columnProportions, setColumnProportions] = useState<number[]>(() => {
    if (pattern?.columnProportions && pattern.columnProportions.length === columns.length) {
      return pattern.columnProportions;
    }
    return columns.map(col => col.widthPercentage / 100);
  });
  
  // Zone proportions per column
  const [zoneProportionsMap, setZoneProportionsMap] = useState<Record<string, number[]>>(() => {
    const map: Record<string, number[]> = {};
    columns.forEach(col => {
      if (col.zones.length > 0) {
        map[col.id] = col.zones.map(() => 1 / col.zones.length);
      } else {
        map[col.id] = [];
      }
    });
    return map;
  });
  
  // Selection state: which column and zone is selected
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(0);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number | null>(null);

  // Sync zone proportions when zones change
  useEffect(() => {
    setZoneProportionsMap(prev => {
      const newMap = { ...prev };
      columns.forEach(col => {
        if (!newMap[col.id] || newMap[col.id].length !== col.zones.length) {
          if (col.zones.length > 0) {
            newMap[col.id] = col.zones.map(() => 1 / col.zones.length);
          } else {
            newMap[col.id] = [];
          }
        }
      });
      return newMap;
    });
  }, [columns]);

  // Drag state
  const [isDraggingZone, setIsDraggingZone] = useState<{ colIdx: number; zoneIdx: number } | null>(null);
  const [isDraggingColumn, setIsDraggingColumn] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG dimensions
  const padding = 40;
  const maxWidth = 400;
  const maxHeight = 500;
  
  const scaleX = (maxWidth - padding * 2) / dimensions.width;
  const scaleY = (maxHeight - padding * 2) / dimensions.height;
  const scale = Math.min(scaleX, scaleY, 0.5);

  const scaledWidth = dimensions.width * scale;
  const scaledHeight = dimensions.height * scale;
  const scaledThickness = globalSettings.materialThickness * scale;

  const svgWidth = scaledWidth + padding * 2;
  const svgHeight = scaledHeight + padding * 2;

  const internalHeight = scaledHeight - scaledThickness * 2;
  const internalWidth = scaledWidth - scaledThickness * 2;
  const internalX = padding + scaledThickness;
  const internalY = padding + scaledThickness;

  // Get current column and its zones
  const currentColumn = columns[selectedColumnIndex];
  const currentZones = currentColumn?.zones || [];

  // Add column
  const addColumn = useCallback(() => {
    const newCol: PatternColumn = {
      id: generateId(),
      name: `Coluna ${columns.length + 1}`,
      widthPercentage: 100 / (columns.length + 1),
      zones: []
    };
    setColumns(prev => {
      const redistributed = prev.map(col => ({
        ...col,
        widthPercentage: 100 / (prev.length + 1)
      }));
      return [...redistributed, newCol];
    });
    setColumnProportions(prev => {
      const newProps = [...prev, 1];
      const sum = newProps.reduce((a, b) => a + b, 0);
      return newProps.map(p => p / sum);
    });
  }, [columns.length]);

  // Remove column
  const removeColumn = useCallback((colIdx: number) => {
    if (columns.length <= 1) return;
    setColumns(prev => {
      const remaining = prev.filter((_, i) => i !== colIdx);
      const totalWidth = 100;
      return remaining.map(col => ({
        ...col,
        widthPercentage: totalWidth / remaining.length
      }));
    });
    setColumnProportions(prev => {
      const newProps = prev.filter((_, i) => i !== colIdx);
      const sum = newProps.reduce((a, b) => a + b, 0);
      return newProps.map(p => p / sum);
    });
    if (selectedColumnIndex >= colIdx && selectedColumnIndex > 0) {
      setSelectedColumnIndex(selectedColumnIndex - 1);
    }
    setSelectedZoneIndex(null);
  }, [columns.length, selectedColumnIndex]);

  // Add zone to current column
  const addZoneToColumn = useCallback((type: PatternZone['type']) => {
    const allZones = columns.flatMap(c => c.zones);
    const count = allZones.filter(z => z.type === type).length + 1;
    const newZone: PatternZone = {
      id: generateId(),
      type,
      name: `${pt.zoneTypes[type]} ${count}`,
      heightExpression: 'remaining',
      options: type === 'door' ? { hingeType: 'left' } : undefined,
    };
    setColumns(prev => prev.map((col, i) => 
      i === selectedColumnIndex 
        ? { ...col, zones: [...col.zones, newZone] }
        : col
    ));
  }, [columns, selectedColumnIndex]);

  // Remove zone from column
  const removeZoneFromColumn = useCallback((colIdx: number, zoneIdx: number) => {
    const col = columns[colIdx];
    if (!col) return;
    
    setColumns(prev => prev.map((c, i) => 
      i === colIdx 
        ? { ...c, zones: c.zones.filter((_, j) => j !== zoneIdx) }
        : c
    ));
    setZoneProportionsMap(prev => {
      const colProps = prev[col.id] || [];
      const newProps = colProps.filter((_, i) => i !== zoneIdx);
      if (newProps.length === 0) return { ...prev, [col.id]: [] };
      const sum = newProps.reduce((a, b) => a + b, 0);
      return { ...prev, [col.id]: newProps.map(p => p / sum) };
    });
    setSelectedZoneIndex(null);
  }, [columns]);

  // Update zone in column
  const updateZoneInColumn = useCallback((colIdx: number, zoneIdx: number, updates: Partial<PatternZone>) => {
    setColumns(prev => prev.map((col, i) => 
      i === colIdx 
        ? { ...col, zones: col.zones.map((z, j) => j === zoneIdx ? { ...z, ...updates } : z) }
        : col
    ));
  }, []);

  // Toggle door type
  const toggleDoorType = useCallback((colIdx: number, zoneIdx: number) => {
    setColumns(prev => prev.map((col, i) => {
      if (i !== colIdx) return col;
      return {
        ...col,
        zones: col.zones.map((zone, j) => {
          if (j !== zoneIdx || zone.type !== 'door') return zone;
          const currentType = zone.options?.hingeType || 'left';
          const nextType = currentType === 'double' ? 'left' : currentType === 'left' ? 'right' : 'double';
          return { ...zone, options: { ...zone.options, hingeType: nextType } };
        })
      };
    }));
  }, []);

  // Move zone up within column
  const moveZoneUp = useCallback((colIdx: number, zoneIdx: number) => {
    if (zoneIdx <= 0) return;
    const col = columns[colIdx];
    if (!col) return;
    
    setColumns(prev => prev.map((c, i) => {
      if (i !== colIdx) return c;
      const newZones = [...c.zones];
      [newZones[zoneIdx - 1], newZones[zoneIdx]] = [newZones[zoneIdx], newZones[zoneIdx - 1]];
      return { ...c, zones: newZones };
    }));
    setZoneProportionsMap(prev => {
      const props = [...(prev[col.id] || [])];
      [props[zoneIdx - 1], props[zoneIdx]] = [props[zoneIdx], props[zoneIdx - 1]];
      return { ...prev, [col.id]: props };
    });
    setSelectedZoneIndex(zoneIdx - 1);
  }, [columns]);

  // Move zone down within column
  const moveZoneDown = useCallback((colIdx: number, zoneIdx: number) => {
    const col = columns[colIdx];
    if (!col || zoneIdx >= col.zones.length - 1) return;
    
    setColumns(prev => prev.map((c, i) => {
      if (i !== colIdx) return c;
      const newZones = [...c.zones];
      [newZones[zoneIdx], newZones[zoneIdx + 1]] = [newZones[zoneIdx + 1], newZones[zoneIdx]];
      return { ...c, zones: newZones };
    }));
    setZoneProportionsMap(prev => {
      const props = [...(prev[col.id] || [])];
      [props[zoneIdx], props[zoneIdx + 1]] = [props[zoneIdx + 1], props[zoneIdx]];
      return { ...prev, [col.id]: props };
    });
    setSelectedZoneIndex(zoneIdx + 1);
  }, [columns]);

  // Drag handlers for zone dividers
  const handleZoneDragStart = useCallback((colIdx: number, zoneIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingZone({ colIdx, zoneIdx });
  }, []);

  const handleZoneDragMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDraggingZone) return;
    const { colIdx, zoneIdx } = isDraggingZone;
    const col = columns[colIdx];
    if (!col || col.zones.length < 2) return;

    const colProps = zoneProportionsMap[col.id] || [];
    if (colProps.length !== col.zones.length) return;

    // Calculate column X boundaries (currently unused but kept for future reference)
    void colIdx; // Silence unused warning

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const relativeY = (y - internalY) / internalHeight;

    const minProp = 0.1;
    const newProportions = [...colProps];

    let cumTo = 0;
    for (let i = 0; i < zoneIdx; i++) cumTo += newProportions[i];

    const newPos = Math.max(minProp * (zoneIdx + 1), Math.min(1 - minProp * (col.zones.length - zoneIdx - 1), relativeY));
    const newUpper = newPos - cumTo;
    const diff = newUpper - newProportions[zoneIdx];

    if (newUpper >= minProp && newProportions[zoneIdx + 1] - diff >= minProp) {
      newProportions[zoneIdx] = newUpper;
      newProportions[zoneIdx + 1] -= diff;
      const sum = newProportions.reduce((a, b) => a + b, 0);
      setZoneProportionsMap(prev => ({ ...prev, [col.id]: newProportions.map(p => p / sum) }));
    }
  }, [isDraggingZone, columns, zoneProportionsMap, columnProportions, internalX, internalY, internalWidth, internalHeight]);

  // Drag handlers for column dividers
  const handleColumnDragStart = useCallback((colIdx: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingColumn(colIdx);
  }, []);

  const handleColumnDragMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingColumn === null || columns.length < 2) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = (x - internalX) / internalWidth;

    const minProp = 0.15; // Minimum 15% width per column
    const newProportions = [...columnProportions];

    let cumTo = 0;
    for (let i = 0; i < isDraggingColumn; i++) cumTo += newProportions[i];

    const newPos = Math.max(minProp * (isDraggingColumn + 1), Math.min(1 - minProp * (columns.length - isDraggingColumn - 1), relativeX));
    const newLeft = newPos - cumTo;
    const diff = newLeft - newProportions[isDraggingColumn];

    if (newLeft >= minProp && newProportions[isDraggingColumn + 1] - diff >= minProp) {
      newProportions[isDraggingColumn] = newLeft;
      newProportions[isDraggingColumn + 1] -= diff;
      const sum = newProportions.reduce((a, b) => a + b, 0);
      setColumnProportions(newProportions.map(p => p / sum));
    }
  }, [isDraggingColumn, columns.length, columnProportions, internalX, internalWidth]);

  const handleDragEnd = useCallback(() => {
    setIsDraggingZone(null);
    setIsDraggingColumn(null);
  }, []);

  // Calculate visual rects for all columns and zones
  interface ColumnRect {
    id: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    proportion: number;
    colIndex: number;
    zones: ZoneRect[];
  }
  
  interface ZoneRect extends PatternZone {
    x: number;
    y: number;
    width: number;
    height: number;
    actualHeight: number;
    actualWidth: number;
    proportion: number;
    zoneIndex: number;
    colIndex: number;
  }

  const columnRects = useMemo((): ColumnRect[] => {
    const result: ColumnRect[] = [];
    let currentX = internalX;
    
    columns.forEach((col, colIdx) => {
      const colProportion = columnProportions[colIdx] || 1 / columns.length;
      const colWidth = internalWidth * colProportion;
      const colZoneProportions = zoneProportionsMap[col.id] || [];
      
      const zones: ZoneRect[] = [];
      let currentY = internalY;
      
      col.zones.forEach((zone, zoneIdx) => {
        const zoneProportion = colZoneProportions[zoneIdx] || 1 / Math.max(1, col.zones.length);
        const zoneHeight = internalHeight * zoneProportion;
        const actualHeight = Math.round((dimensions.height - globalSettings.materialThickness * 2) * zoneProportion);
        const actualWidth = Math.round((dimensions.width - globalSettings.materialThickness * 2 - (columns.length - 1) * globalSettings.materialThickness) * colProportion);
        
        zones.push({
          ...zone,
          x: currentX,
          y: currentY,
          width: colWidth,
          height: zoneHeight,
          actualHeight,
          actualWidth,
          proportion: zoneProportion,
          zoneIndex: zoneIdx,
          colIndex: colIdx,
        });
        
        currentY += zoneHeight;
      });
      
      result.push({
        id: col.id,
        name: col.name,
        x: currentX,
        y: internalY,
        width: colWidth,
        height: internalHeight,
        proportion: colProportion,
        colIndex: colIdx,
        zones,
      });
      
      currentX += colWidth;
    });
    
    return result;
  }, [columns, columnProportions, zoneProportionsMap, internalX, internalY, internalWidth, internalHeight, dimensions, globalSettings.materialThickness]);

  // Build pattern for saving
  const buildPattern = useCallback((): CabinetPattern => {
    const internalH = dimensions.height - 2 * globalSettings.materialThickness;
    
    // Update columns with calculated heights
    const columnsWithHeights: PatternColumn[] = columns.map((col, colIdx) => {
      const colZoneProps = zoneProportionsMap[col.id] || [];
      return {
        ...col,
        widthPercentage: columnProportions[colIdx] * 100,
        zones: col.zones.map((zone, zIdx) => ({
          ...zone,
          heightExpression: String(Math.round(internalH * (colZoneProps[zIdx] || 1 / Math.max(1, col.zones.length)))),
        }))
      };
    });
    
    // For backwards compatibility, flatten zones into the zones array
    const allZones = columnsWithHeights.flatMap(c => c.zones);
    
    return {
      id: pattern?.id || generateId(),
      name: name || 'Novo Modelo',
      description,
      category,
      columns: columnsWithHeights,
      columnProportions: columnProportions,
      zones: allZones, // Backwards compatibility
      partRules: generatePartRules(columnsWithHeights, columnProportions),
      defaultDimensions: dimensions,
      materials: patternMaterials, // Pattern-specific material configuration
      variables: {},
      createdAt: pattern?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [pattern, name, description, category, columns, columnProportions, zoneProportionsMap, dimensions, globalSettings.materialThickness, patternMaterials]);

  // Get door hinge label
  const getDoorLabel = (zone: PatternZone) => {
    const hinge = zone.options?.hingeType || 'left';
    if (hinge === 'double') return 'Porta Dupla';
    if (hinge === 'right') return 'Porta (Dir)';
    return 'Porta (Esq)';
  };

  return (
    <div className={cn('fixed inset-0 z-50 bg-gray-100 dark:bg-gray-900 flex flex-col', className)}>
      {/* Header */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">{pattern ? pt.patternEditor.editPattern : pt.patternEditor.newPattern}</h1>
            <p className="text-xs text-gray-500">{pt.patternEditor.dragToResize}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className={cn('p-2 rounded-lg transition-colors', showSettings ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500')}>
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={() => onSave(buildPattern())} disabled={!name.trim()} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg">
            <Save className="w-4 h-4" />
            {pt.patternEditor.savePattern}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-2 shrink-0">
        {/* Column selector */}
        <div className="flex items-center gap-1 mr-2">
          {columns.map((col, idx) => (
            <button
              key={col.id}
              onClick={() => { setSelectedColumnIndex(idx); setSelectedZoneIndex(null); }}
              className={cn(
                'px-2 py-1 text-xs rounded border transition-colors',
                selectedColumnIndex === idx 
                  ? 'bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
              )}
            >
              {col.name}
            </button>
          ))}
          <button
            onClick={addColumn}
            className="p-1 text-xs rounded border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-600"
            title="Adicionar coluna"
          >
            <Plus className="w-3 h-3" />
          </button>
          {columns.length > 1 && (
            <button
              onClick={() => removeColumn(selectedColumnIndex)}
              className="p-1 text-xs rounded text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500"
              title="Remover coluna selecionada"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Adicionar zona:</span>
        <button onClick={() => addZoneToColumn('drawer')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors">
          <Box className="w-4 h-4" />
          {pt.zoneTypes.drawer}
        </button>
        <button onClick={() => addZoneToColumn('door')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors">
          <Square className="w-4 h-4" />
          {pt.zoneTypes.door}
        </button>
        <button onClick={() => addZoneToColumn('shelf')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 transition-colors">
          <Layers className="w-4 h-4" />
          {pt.zoneTypes.shelf}
        </button>
        <button onClick={() => addZoneToColumn('opening')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
          <ArrowDown className="w-4 h-4" />
          {pt.zoneTypes.opening}
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
        
        <button onClick={() => addZoneToColumn('appliance-space')} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-slate-900/40 text-slate-700 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
          <Refrigerator className="w-4 h-4" />
          Electrodoméstico
        </button>
        
        <div className="flex-1" />
        
        {selectedZoneIndex !== null && currentZones[selectedZoneIndex] && (
          <div className="flex items-center gap-2">
            {/* Move up/down buttons */}
            <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => moveZoneUp(selectedColumnIndex, selectedZoneIndex)}
                disabled={selectedZoneIndex === 0}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
                title="Mover para cima"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600" />
              <button
                onClick={() => moveZoneDown(selectedColumnIndex, selectedZoneIndex)}
                disabled={selectedZoneIndex === currentZones.length - 1}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400"
                title="Mover para baixo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {currentZones[selectedZoneIndex]?.type === 'door' && (
              <button onClick={() => toggleDoorType(selectedColumnIndex, selectedZoneIndex)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-lg border border-purple-200 dark:border-purple-800">
                <RotateCw className="w-4 h-4" />
                {getDoorLabel(currentZones[selectedZoneIndex])}
              </button>
            )}
            <button onClick={() => removeZoneFromColumn(selectedColumnIndex, selectedZoneIndex)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
              <Trash2 className="w-4 h-4" />
              Remover
            </button>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualizer */}
        <div ref={containerRef} className="flex-1 flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className={cn('select-none', (isDraggingZone || isDraggingColumn) ? 'cursor-move' : '')}
              onMouseMove={(e) => { handleZoneDragMove(e); handleColumnDragMove(e); }}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {/* Cabinet frame */}
              <rect x={padding} y={padding} width={scaledWidth} height={scaledHeight} fill="#d1d5db" stroke="#9ca3af" strokeWidth={1} />
              <rect x={internalX} y={internalY} width={internalWidth} height={internalHeight} fill="#f9fafb" />

              {/* Empty state */}
              {columns.every(c => c.zones.length === 0) && (
                <text x={svgWidth / 2} y={svgHeight / 2} textAnchor="middle" dominantBaseline="middle" className="fill-gray-400" style={{ fontSize: '12px' }}>
                  Selecione uma coluna e adicione zonas
                </text>
              )}

              {/* Render columns and zones */}
              {columnRects.map((col) => (
                <g key={col.id}>
                  {/* Column background - highlight selected column */}
                  <rect
                    x={col.x}
                    y={col.y}
                    width={col.width}
                    height={col.height}
                    fill={selectedColumnIndex === col.colIndex ? 'rgba(139, 92, 246, 0.05)' : 'transparent'}
                    stroke={selectedColumnIndex === col.colIndex ? '#8b5cf6' : 'transparent'}
                    strokeWidth={1}
                    strokeDasharray="4,2"
                    onClick={() => { setSelectedColumnIndex(col.colIndex); setSelectedZoneIndex(null); }}
                    className="cursor-pointer"
                  />
                  
                  {/* Zones within this column */}
                  {col.zones.map((zone) => {
                    const isSelected = selectedColumnIndex === zone.colIndex && selectedZoneIndex === zone.zoneIndex;
                    const isDrawer = zone.type === 'drawer';
                    const isDoor = zone.type === 'door';
                    const isDoubleDoor = isDoor && zone.options?.hingeType === 'double';
                    const hingeRight = isDoor && zone.options?.hingeType === 'right';
                    const isShelf = zone.type === 'shelf' || zone.type === 'fixed-shelf';
                    const isOpening = zone.type === 'opening';
                    const shelfThickness = 8;

                    return (
                      <g 
                        key={zone.id} 
                        onClick={() => { setSelectedColumnIndex(zone.colIndex); setSelectedZoneIndex(zone.zoneIndex); }} 
                        className="cursor-pointer"
                      >
                        {/* Zone background */}
                        {!isShelf && !isOpening && (
                          <rect
                            x={zone.x + 1}
                            y={zone.y + 1}
                            width={zone.width - 2}
                            height={zone.height - 2}
                            fill={isDrawer ? '#fef3c7' : isDoor ? '#dbeafe' : '#ffffff'}
                            stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
                            strokeWidth={isSelected ? 2 : 1}
                          />
                        )}
                        
                        {/* Shelf visualization */}
                        {isShelf && (
                          <>
                            <rect
                              x={zone.x + 1}
                              y={zone.y + 1}
                              width={zone.width - 2}
                              height={zone.height - shelfThickness - 2}
                              fill="#f9fafb"
                              stroke={isSelected ? '#3b82f6' : '#e5e7eb'}
                              strokeWidth={isSelected ? 2 : 1}
                              strokeDasharray={isSelected ? undefined : '4,2'}
                            />
                            <rect
                              x={zone.x + 1}
                              y={zone.y + zone.height - shelfThickness}
                              width={zone.width - 2}
                              height={shelfThickness}
                              fill="#d4a574"
                              stroke={isSelected ? '#3b82f6' : '#a3785a'}
                              strokeWidth={isSelected ? 2 : 1}
                            />
                          </>
                        )}
                        
                        {/* Opening visualization */}
                        {isOpening && (
                          <rect
                            x={zone.x + 1}
                            y={zone.y + 1}
                            width={zone.width - 2}
                            height={zone.height - 2}
                            fill="#f9fafb"
                            stroke={isSelected ? '#3b82f6' : '#9ca3af'}
                            strokeWidth={isSelected ? 2 : 1}
                            strokeDasharray={isSelected ? undefined : '4,2'}
                          />
                        )}
                        
                        {/* Door visualization */}
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
                        
                        {/* Double door */}
                        {isDoubleDoor && (
                          <>
                            <line x1={zone.x + zone.width / 2} y1={zone.y + 4} x2={zone.x + zone.width / 2} y2={zone.y + zone.height - 4} stroke="#93c5fd" strokeWidth={1} strokeDasharray="3,2" />
                            <circle cx={zone.x + 6} cy={zone.y + zone.height / 2} r={2} fill="#3b82f6" />
                            <circle cx={zone.x + zone.width - 6} cy={zone.y + zone.height / 2} r={2} fill="#3b82f6" />
                          </>
                        )}

                        {/* Drawer handle */}
                        {isDrawer && (
                          <rect x={zone.x + zone.width / 2 - 15} y={zone.y + zone.height / 2 - 2} width={30} height={4} rx={2} fill="#d97706" opacity={0.5} />
                        )}

                        {/* Label */}
                        <text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2 - 8} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '10px', fontWeight: 500 }} className="fill-gray-600 pointer-events-none">
                          {zone.name}
                        </text>
                        <text x={zone.x + zone.width / 2} y={zone.y + zone.height / 2 + 8} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '9px' }} className="fill-gray-400 pointer-events-none">
                          {zone.actualHeight}mm ({Math.round(zone.proportion * 100)}%)
                        </text>
                      </g>
                    );
                  })}
                  
                  {/* Zone dividers within this column */}
                  {col.zones.slice(0, -1).map((zone, zoneIdx) => {
                    const dividerY = zone.y + zone.height;
                    const isActive = isDraggingZone?.colIdx === col.colIndex && isDraggingZone?.zoneIdx === zoneIdx;
                    return (
                      <g key={`zone-divider-${col.id}-${zoneIdx}`}>
                        <rect x={zone.x + 2} y={dividerY - 6} width={zone.width - 4} height={12} fill="transparent" className="cursor-row-resize" onMouseDown={(e) => handleZoneDragStart(col.colIndex, zoneIdx, e)} />
                        <line x1={zone.x + 4} y1={dividerY} x2={zone.x + zone.width - 4} y2={dividerY} stroke={isActive ? '#3b82f6' : '#d1d5db'} strokeWidth={isActive ? 2 : 1} className="pointer-events-none" />
                        <rect x={zone.x + zone.width / 2 - 12} y={dividerY - 3} width={24} height={6} fill={isActive ? '#3b82f6' : '#9ca3af'} rx={3} className="pointer-events-none" opacity={isActive ? 1 : 0.6} />
                      </g>
                    );
                  })}
                </g>
              ))}

              {/* Column dividers */}
              {columnRects.slice(0, -1).map((col) => {
                const dividerX = col.x + col.width;
                const isActive = isDraggingColumn === col.colIndex;
                return (
                  <g key={`col-divider-${col.id}`}>
                    <rect x={dividerX - 6} y={internalY} width={12} height={internalHeight} fill="transparent" className="cursor-col-resize" onMouseDown={(e) => handleColumnDragStart(col.colIndex, e)} />
                    <line x1={dividerX} y1={internalY + 4} x2={dividerX} y2={internalY + internalHeight - 4} stroke={isActive ? '#8b5cf6' : '#a78bfa'} strokeWidth={isActive ? 2 : 1} className="pointer-events-none" />
                    <rect x={dividerX - 3} y={internalY + internalHeight / 2 - 12} width={6} height={24} fill={isActive ? '#8b5cf6' : '#a78bfa'} rx={3} className="pointer-events-none" opacity={isActive ? 1 : 0.7} />
                  </g>
                );
              })}

              {/* Dimensions */}
              <g>
                <line x1={padding} y1={svgHeight - 12} x2={padding + scaledWidth} y2={svgHeight - 12} stroke="#9ca3af" strokeWidth={1} />
                <text x={padding + scaledWidth / 2} y={svgHeight - 2} textAnchor="middle" className="fill-gray-500" style={{ fontSize: '10px' }}>{dimensions.width}mm</text>
              </g>
              <g>
                <line x1={12} y1={padding} x2={12} y2={padding + scaledHeight} stroke="#9ca3af" strokeWidth={1} />
                <text x={8} y={padding + scaledHeight / 2} textAnchor="middle" transform={`rotate(-90, 8, ${padding + scaledHeight / 2})`} className="fill-gray-500" style={{ fontSize: '10px' }}>{dimensions.height}mm</text>
              </g>
            </svg>

            <p className="text-xs text-gray-400 mt-2">{pt.patternEditor.dragToResize}</p>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <aside className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto shrink-0">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Configurações do Modelo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.pattern.patternName} *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Armário 2 Gavetas" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.pattern.patternDescription}</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição opcional..." rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.pattern.category}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as CabinetPattern['category'])} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  {Object.entries(pt.categories).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.pattern.defaultDimensions} (mm)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="relative">
                    <label className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">A</label>
                    <input type="number" value={dimensions.height} onChange={(e) => setDimensions(d => ({ ...d, height: parseInt(e.target.value) || 720 }))} className="w-full pl-6 pr-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  </div>
                  <div className="relative">
                    <label className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">L</label>
                    <input type="number" value={dimensions.width} onChange={(e) => setDimensions(d => ({ ...d, width: parseInt(e.target.value) || 600 }))} className="w-full pl-6 pr-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  </div>
                  <div className="relative">
                    <label className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">P</label>
                    <input type="number" value={dimensions.depth} onChange={(e) => setDimensions(d => ({ ...d, depth: parseInt(e.target.value) || 560 }))} className="w-full pl-6 pr-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Materials Configuration */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Materiais do Modelo</h4>
                <div className="space-y-3">
                  {/* Carcass material */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Carcaça (Laterais, Topo, Base)</label>
                    <div className="flex gap-2">
                      <select 
                        value={patternMaterials?.carcass?.materialId || ''} 
                        onChange={(e) => {
                          const mat = materials.find(m => m.id === e.target.value);
                          setPatternMaterials(prev => ({ 
                            ...prev, 
                            carcass: { 
                              materialId: e.target.value, 
                              thickness: mat?.thickness || prev?.carcass?.thickness || 18 
                            } 
                          }));
                        }}
                        className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Padrão Global</option>
                        {materials.filter(m => ['board', 'mdf', 'melamine', 'plywood'].includes(m.type)).map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.thickness}mm)</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        value={patternMaterials?.carcass?.thickness || globalSettings.materialThickness}
                        onChange={(e) => setPatternMaterials(prev => ({ 
                          ...prev, 
                          carcass: { 
                            materialId: prev?.carcass?.materialId || '', 
                            thickness: parseInt(e.target.value) || 18 
                          } 
                        }))}
                        className="w-16 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                        placeholder="mm"
                      />
                    </div>
                  </div>
                  
                  {/* Back material */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Traseira</label>
                    <div className="flex gap-2">
                      <select 
                        value={patternMaterials?.back?.materialId || ''} 
                        onChange={(e) => {
                          const mat = materials.find(m => m.id === e.target.value);
                          setPatternMaterials(prev => ({ 
                            ...prev, 
                            back: { 
                              materialId: e.target.value, 
                              thickness: mat?.thickness || prev?.back?.thickness || 3 
                            } 
                          }));
                        }}
                        className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Padrão Global</option>
                        {materials.filter(m => ['hdf', 'back-panel', 'board'].includes(m.type)).map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.thickness}mm)</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        value={patternMaterials?.back?.thickness || globalSettings.backPanelThickness}
                        onChange={(e) => setPatternMaterials(prev => ({ 
                          ...prev, 
                          back: { 
                            materialId: prev?.back?.materialId || '', 
                            thickness: parseInt(e.target.value) || 3 
                          } 
                        }))}
                        className="w-16 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                        placeholder="mm"
                      />
                    </div>
                  </div>
                  
                  {/* Front material */}
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frentes (Portas, Gavetas)</label>
                    <div className="flex gap-2">
                      <select 
                        value={patternMaterials?.front?.materialId || ''} 
                        onChange={(e) => {
                          const mat = materials.find(m => m.id === e.target.value);
                          setPatternMaterials(prev => ({ 
                            ...prev, 
                            front: { 
                              materialId: e.target.value, 
                              thickness: mat?.thickness || prev?.front?.thickness || 18 
                            } 
                          }));
                        }}
                        className="flex-1 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Mesmo que carcaça</option>
                        {materials.filter(m => ['board', 'mdf', 'melamine', 'plywood'].includes(m.type)).map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.thickness}mm)</option>
                        ))}
                      </select>
                      <input 
                        type="number" 
                        value={patternMaterials?.front?.thickness || patternMaterials?.carcass?.thickness || globalSettings.materialThickness}
                        onChange={(e) => setPatternMaterials(prev => ({ 
                          ...prev, 
                          front: { 
                            materialId: prev?.front?.materialId || '', 
                            thickness: parseInt(e.target.value) || 18 
                          } 
                        }))}
                        className="w-16 px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                        placeholder="mm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Colunas ({columns.length}) / Zonas ({columns.reduce((sum, c) => sum + c.zones.length, 0)})
                </h4>
                <div className="space-y-3">
                  {columns.map((col, colIdx) => (
                    <div key={col.id} className={cn(
                      'border rounded-lg overflow-hidden',
                      selectedColumnIndex === colIdx ? 'border-violet-400 dark:border-violet-600' : 'border-gray-200 dark:border-gray-600'
                    )}>
                      {/* Column header */}
                      <div 
                        className={cn(
                          'flex items-center gap-2 px-2 py-1.5 cursor-pointer',
                          selectedColumnIndex === colIdx ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-gray-50 dark:bg-gray-700/50'
                        )}
                        onClick={() => { setSelectedColumnIndex(colIdx); setSelectedZoneIndex(null); }}
                      >
                        <GripVertical className="w-3 h-3 text-gray-400" />
                        <Columns className="w-3 h-3 text-violet-500" />
                        <input 
                          type="text" 
                          value={col.name} 
                          onChange={(e) => setColumns(prev => prev.map((c, i) => i === colIdx ? { ...c, name: e.target.value } : c))}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 min-w-0 px-1 py-0.5 text-xs rounded border-0 bg-transparent text-gray-700 dark:text-gray-300"
                        />
                        <span className="text-xs text-gray-400 tabular-nums">{Math.round(columnProportions[colIdx] * 100)}%</span>
                      </div>
                      
                      {/* Zones in this column */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-600">
                        {col.zones.map((zone, zoneIdx) => (
                          <div 
                            key={zone.id} 
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1.5 cursor-pointer',
                              selectedColumnIndex === colIdx && selectedZoneIndex === zoneIdx 
                                ? 'bg-blue-50 dark:bg-blue-900/20' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                            )}
                            onClick={() => { setSelectedColumnIndex(colIdx); setSelectedZoneIndex(zoneIdx); }}
                          >
                            <div className="flex flex-col ml-3">
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveZoneUp(colIdx, zoneIdx); }} 
                                disabled={zoneIdx === 0} 
                                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 text-gray-400"
                              >
                                <ChevronUp className="w-2.5 h-2.5" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); moveZoneDown(colIdx, zoneIdx); }} 
                                disabled={zoneIdx === col.zones.length - 1} 
                                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 text-gray-400"
                              >
                                <ChevronDown className="w-2.5 h-2.5" />
                              </button>
                            </div>
                            <span className={cn('w-5 h-5 rounded flex items-center justify-center text-xs shrink-0', 
                              zone.type === 'drawer' ? 'bg-amber-100 text-amber-700' : 
                              zone.type === 'door' ? 'bg-blue-100 text-blue-700' : 
                              zone.type === 'shelf' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            )}>
                              {zone.type === 'drawer' ? <Box className="w-2.5 h-2.5" /> : 
                               zone.type === 'door' ? <Square className="w-2.5 h-2.5" /> : 
                               zone.type === 'shelf' ? <Layers className="w-2.5 h-2.5" /> : 
                               <ArrowDown className="w-2.5 h-2.5" />}
                            </span>
                            <input 
                              type="text" 
                              value={zone.name} 
                              onChange={(e) => updateZoneInColumn(colIdx, zoneIdx, { name: e.target.value })} 
                              onClick={(e) => e.stopPropagation()} 
                              className="flex-1 min-w-0 px-1 py-0.5 text-xs rounded border-0 bg-transparent text-gray-700 dark:text-gray-300" 
                            />
                            <span className="text-xs text-gray-400 tabular-nums shrink-0">
                              {Math.round((zoneProportionsMap[col.id]?.[zoneIdx] || 0) * 100)}%
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeZoneFromColumn(colIdx, zoneIdx); }} 
                              className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 shrink-0"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                        {col.zones.length === 0 && (
                          <p className="text-xs text-gray-400 text-center py-2 italic">Sem zonas</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
