import { Suspense, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from '@react-three/drei';
import { useCabinetStore, useMaterialById } from '../store/cabinetStore';
import type { CabinetInstance, PatternZone, Material } from '../types';

// ============================================
// Material Helpers
// ============================================

function getMaterialColor(material?: Material): string {
  if (!material) return '#D4A574'; // Default wood color
  
  const colorMap: Record<string, string> = {
    'mdf-18': '#C9B896',
    'mdf-16': '#C9B896',
    'mdf-mr': '#C9B896',
    'mel-white': '#FFFFFF',
    'mel-oak': '#D4A574',
    'mel-walnut': '#654321',
    'mel-grey': '#808080',
    'ply-birch': '#F5DEB3',
    'ply-marine': '#DEB887',
    'hdf-3': '#A0522D',
    'ctp-laminate': '#2F4F4F',
    'ctp-granite': '#696969',
    'ctp-quartz': '#E8E8E8',
    'ctp-solid': '#F5F5F5',
  };
  
  return colorMap[material.id] || material.color || '#D4A574';
}

// ============================================
// Cabinet 3D Box Component
// ============================================

interface CabinetBoxProps {
  cabinet: CabinetInstance;
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}

function CabinetBox({ cabinet, position, isSelected, onClick }: CabinetBoxProps) {
  const [hovered, setHovered] = useState(false);
  
  const bodyMaterial = useMaterialById(cabinet.materials?.body);
  const frontMaterial = useMaterialById(cabinet.materials?.front);
  
  // Convert mm to meters for Three.js
  const width = cabinet.dimensions.width / 1000;
  const height = cabinet.dimensions.height / 1000;
  const depth = cabinet.dimensions.depth / 1000;
  const thickness = (cabinet.materials?.thickness || 18) / 1000;
  
  const bodyColor = getMaterialColor(bodyMaterial);
  const frontColor = getMaterialColor(frontMaterial);
  
  // Get pattern zones
  const patterns = useCabinetStore((s) => s.patterns);
  const pattern = patterns.find((p) => p.id === cabinet.patternId);
  
  // Check if pattern uses new column-based structure
  const hasColumns = pattern?.columns && pattern.columns.length > 0;
  
  // Get column proportions
  const columnProportions = useMemo(() => {
    if (!pattern?.columns || pattern.columns.length === 0) return [];
    if (pattern.columnProportions && pattern.columnProportions.length === pattern.columns.length) {
      return pattern.columnProportions;
    }
    return Array(pattern.columns.length).fill(1 / pattern.columns.length);
  }, [pattern?.columns, pattern?.columnProportions]);
  
  // Get zone proportions from cabinet instance, or default to equal distribution
  const zoneProportions = useMemo(() => {
    const zoneCount = pattern?.zones.length || 0;
    if (cabinet.zoneProportions && cabinet.zoneProportions.length === zoneCount) {
      return cabinet.zoneProportions;
    }
    // Default: equal proportions
    return Array(zoneCount).fill(zoneCount > 0 ? 1 / zoneCount : 0);
  }, [pattern?.zones.length, cabinet.zoneProportions]);
  
  return (
    <group position={position} onClick={onClick}>
      {/* Left Side Panel */}
      <mesh
        position={[-width / 2 + thickness / 2, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial 
          color={isSelected ? '#4CAF50' : hovered ? '#81C784' : bodyColor} 
        />
      </mesh>
      
      {/* Right Side Panel */}
      <mesh position={[width / 2 - thickness / 2, height / 2, 0]}>
        <boxGeometry args={[thickness, height, depth]} />
        <meshStandardMaterial 
          color={isSelected ? '#4CAF50' : hovered ? '#81C784' : bodyColor} 
        />
      </mesh>
      
      {/* Top Panel */}
      <mesh position={[0, height - thickness / 2, 0]}>
        <boxGeometry args={[width - thickness * 2, thickness, depth]} />
        <meshStandardMaterial 
          color={isSelected ? '#4CAF50' : hovered ? '#81C784' : bodyColor} 
        />
      </mesh>
      
      {/* Bottom Panel */}
      <mesh position={[0, thickness / 2, 0]}>
        <boxGeometry args={[width - thickness * 2, thickness, depth]} />
        <meshStandardMaterial 
          color={isSelected ? '#4CAF50' : hovered ? '#81C784' : bodyColor} 
        />
      </mesh>
      
      {/* Back Panel */}
      {cabinet.backPanel?.type !== 'none' && (
        <mesh position={[0, height / 2, -depth / 2 + (cabinet.backPanel?.thickness || 3) / 2000]}>
          <boxGeometry 
            args={[
              width - thickness * 2, 
              height - thickness * 2, 
              (cabinet.backPanel?.thickness || 3) / 1000
            ]} 
          />
          <meshStandardMaterial 
            color={isSelected ? '#388E3C' : '#A0522D'} 
          />
        </mesh>
      )}
      
      {/* Render Column-based zones */}
      {hasColumns && pattern?.columns?.map((column, colIdx) => {
        // Calculate column X position
        const innerWidth = width - thickness * 2;
        let colStartX = -innerWidth / 2;
        for (let i = 0; i < colIdx; i++) {
          colStartX += innerWidth * columnProportions[i];
        }
        const colWidth = innerWidth * columnProportions[colIdx];
        const colCenterX = colStartX + colWidth / 2;
        
        // Get zone proportions for this column
        const colZoneProportions = cabinet.columnZoneProportions?.[column.id] 
          || column.zones.map(() => 1 / column.zones.length);
        
        return (
          <group key={column.id}>
            {/* Column zones */}
            {column.zones.map((zone, zoneIdx) => (
              <ColumnZoneComponent
                key={zone.id}
                zone={zone}
                index={zoneIdx}
                totalZones={column.zones.length}
                zoneProportions={colZoneProportions}
                columnWidth={colWidth}
                columnCenterX={colCenterX}
                cabinetDimensions={{ width, height, depth, thickness }}
                frontColor={frontColor}
                bodyColor={bodyColor}
                isSelected={isSelected}
              />
            ))}
            
            {/* Vertical divider after column (except last) */}
            {colIdx < (pattern?.columns?.length || 0) - 1 && (
              <mesh position={[colStartX + colWidth, height / 2, 0]}>
                <boxGeometry args={[thickness, height - thickness * 2, depth - thickness]} />
                <meshStandardMaterial color={bodyColor} />
              </mesh>
            )}
          </group>
        );
      })}
      
      {/* Render legacy flat zones (non-column patterns) */}
      {!hasColumns && pattern?.zones.map((zone, index) => (
        <ZoneComponent
          key={zone.id}
          zone={zone}
          index={index}
          totalZones={pattern.zones.length}
          zoneProportions={zoneProportions}
          cabinetDimensions={{ width, height, depth, thickness }}
          frontColor={frontColor}
          bodyColor={bodyColor}
          isSelected={isSelected}
        />
      ))}
      
      {/* Label */}
      <Html position={[0, height + 0.1, 0]} center>
        <div className="bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          {cabinet.name}
        </div>
      </Html>
    </group>
  );
}

// ============================================
// Zone Component (Drawer, Door, Shelf, etc.)
// ============================================

interface ZoneComponentProps {
  zone: PatternZone;
  index: number;
  totalZones: number;
  zoneProportions: number[];
  cabinetDimensions: { width: number; height: number; depth: number; thickness: number };
  frontColor: string;
  bodyColor: string;
  isSelected: boolean;
}

function ZoneComponent({ zone, index, totalZones, zoneProportions, cabinetDimensions, frontColor, bodyColor, isSelected }: ZoneComponentProps) {
  const { width, height, depth, thickness } = cabinetDimensions;
  const innerWidth = width - thickness * 2;
  const innerHeight = height - thickness * 2;
  
  // Use actual zone proportions from cabinet instance
  const proportion = zoneProportions[index] || (1 / totalZones);
  const zoneHeight = proportion * innerHeight;
  
  // Calculate Y position by summing proportions of zones above this one
  // Zones are rendered from top to bottom
  let cumulativeHeight = 0;
  for (let i = 0; i < index; i++) {
    cumulativeHeight += (zoneProportions[i] || 1 / totalZones) * innerHeight;
  }
  
  // Zone Y is measured from the bottom of the cabinet
  // So we calculate: height - top_thickness - cumulative_from_top - zone_height/2
  const zoneY = height - thickness - cumulativeHeight - zoneHeight / 2;
  
  const gap = 0.003; // 3mm gap between elements
  const drawerSideThickness = 0.012; // 12mm drawer sides
  const drawerBottomThickness = 0.006; // 6mm drawer bottom
  
  switch (zone.type) {
    case 'drawer':
      // Full drawer box with front, sides, back, and bottom
      return (
        <group position={[0, zoneY, 0]}>
          {/* Drawer Front Panel */}
          <mesh position={[0, 0, depth / 2 - thickness / 2]}>
            <boxGeometry args={[innerWidth - gap * 2, zoneHeight - gap * 2, thickness]} />
            <meshStandardMaterial color={isSelected ? '#66BB6A' : frontColor} />
          </mesh>
          
          {/* Drawer Box - Left Side */}
          <mesh position={[-innerWidth / 2 + drawerSideThickness / 2 + gap, 0, 0]}>
            <boxGeometry args={[drawerSideThickness, zoneHeight - gap * 4, depth - thickness * 2]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          
          {/* Drawer Box - Right Side */}
          <mesh position={[innerWidth / 2 - drawerSideThickness / 2 - gap, 0, 0]}>
            <boxGeometry args={[drawerSideThickness, zoneHeight - gap * 4, depth - thickness * 2]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          
          {/* Drawer Box - Back */}
          <mesh position={[0, 0, -depth / 2 + thickness + drawerSideThickness / 2]}>
            <boxGeometry args={[innerWidth - drawerSideThickness * 2 - gap * 4, zoneHeight - gap * 4, drawerSideThickness]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          
          {/* Drawer Box - Bottom */}
          <mesh position={[0, -zoneHeight / 2 + drawerBottomThickness / 2 + gap * 2, 0]}>
            <boxGeometry args={[innerWidth - drawerSideThickness * 2 - gap * 4, drawerBottomThickness, depth - thickness * 2 - drawerSideThickness]} />
            <meshStandardMaterial color={bodyColor} />
          </mesh>
          
          {/* Handle */}
          <mesh position={[0, 0, depth / 2 + 0.005]}>
            <boxGeometry args={[0.08, 0.015, 0.015]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
      
    case 'door':
      return (
        <group position={[0, zoneY, depth / 2 - thickness / 2]}>
          {/* Door Panel */}
          <mesh>
            <boxGeometry args={[innerWidth - gap * 2, zoneHeight - gap * 2, thickness]} />
            <meshStandardMaterial color={isSelected ? '#66BB6A' : frontColor} />
          </mesh>
          {/* Handle */}
          <mesh position={[innerWidth / 2 - 0.03, 0, thickness / 2 + 0.005]}>
            <boxGeometry args={[0.015, 0.08, 0.015]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
      
    case 'shelf':
    case 'fixed-shelf':
      // Shelf positioned at the BOTTOM of the zone (items sit on top of it)
      const shelfY = zoneY - zoneHeight / 2 + thickness / 2;
      return (
        <mesh position={[0, shelfY, 0]}>
          <boxGeometry args={[innerWidth, thickness, depth - thickness]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      );
      
    case 'opening':
      // Opening is just empty space, render nothing
      return null;
      
    case 'appliance-space':
      return (
        <group position={[0, zoneY, 0]}>
          {/* Appliance placeholder */}
          <mesh>
            <boxGeometry args={[innerWidth * 0.9, zoneHeight * 0.9, depth * 0.8]} />
            <meshStandardMaterial color="#4A4A4A" transparent opacity={0.5} />
          </mesh>
        </group>
      );
      
    case 'divider':
      // Vertical divider - this should split the cabinet into columns
      // For now, render as a vertical panel in the center
      return (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[thickness, innerHeight, depth - thickness]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      );
      
    default:
      return null;
  }
}

// ============================================
// Countertop Component
// ============================================

interface CountertopProps {
  length: number; // mm
  width: number; // mm
  thickness: number; // mm
  position: [number, number, number];
  color: string;
}

function Countertop({ length, width, thickness, position, color }: CountertopProps) {
  return (
    <mesh position={position}>
      <boxGeometry args={[length / 1000, thickness / 1000, width / 1000]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
  );
}

// ============================================
// Column Zone Component (for column-based patterns)
// ============================================

interface ColumnZoneComponentProps {
  zone: PatternZone;
  index: number;
  totalZones: number;
  zoneProportions: number[];
  columnWidth: number;
  columnCenterX: number;
  cabinetDimensions: { width: number; height: number; depth: number; thickness: number };
  frontColor: string;
  bodyColor: string;
  isSelected: boolean;
}

function ColumnZoneComponent({
  zone,
  index,
  totalZones,
  zoneProportions,
  columnWidth,
  columnCenterX,
  cabinetDimensions,
  frontColor,
  bodyColor,
  isSelected,
}: ColumnZoneComponentProps) {
  const { height, depth, thickness } = cabinetDimensions;
  const innerHeight = height - thickness * 2;
  
  const proportion = zoneProportions[index] || (1 / totalZones);
  const zoneHeight = proportion * innerHeight;
  
  // Calculate Y position
  let cumulativeHeight = 0;
  for (let i = 0; i < index; i++) {
    cumulativeHeight += (zoneProportions[i] || 1 / totalZones) * innerHeight;
  }
  const zoneY = height - thickness - cumulativeHeight - zoneHeight / 2;
  
  const gap = 0.003;
  
  switch (zone.type) {
    case 'drawer':
      return (
        <group position={[columnCenterX, zoneY, 0]}>
          {/* Drawer Front */}
          <mesh position={[0, 0, depth / 2 - thickness / 2]}>
            <boxGeometry args={[columnWidth - gap * 2, zoneHeight - gap * 2, thickness]} />
            <meshStandardMaterial color={isSelected ? '#66BB6A' : frontColor} />
          </mesh>
          {/* Handle */}
          <mesh position={[0, 0, depth / 2 + 0.005]}>
            <boxGeometry args={[0.06, 0.012, 0.012]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
      
    case 'door':
      return (
        <group position={[columnCenterX, zoneY, depth / 2 - thickness / 2]}>
          <mesh>
            <boxGeometry args={[columnWidth - gap * 2, zoneHeight - gap * 2, thickness]} />
            <meshStandardMaterial color={isSelected ? '#66BB6A' : frontColor} />
          </mesh>
          <mesh position={[columnWidth / 2 - 0.02, 0, thickness / 2 + 0.005]}>
            <boxGeometry args={[0.012, 0.06, 0.012]} />
            <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      );
      
    case 'shelf':
    case 'fixed-shelf':
      const shelfY = zoneY - zoneHeight / 2 + thickness / 2;
      return (
        <mesh position={[columnCenterX, shelfY, 0]}>
          <boxGeometry args={[columnWidth - gap * 2, thickness, depth - thickness * 2]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
      );
      
    case 'opening':
      return null;
      
    default:
      return null;
  }
}

// ============================================
// Scene Component
// ============================================

function Scene() {
  const currentProject = useCabinetStore((s) => s.currentProject);
  const selectedCabinetId = useCabinetStore((s) => s.ui.selectedCabinetId);
  const setSelectedCabinet = useCabinetStore((s) => s.setSelectedCabinet);
  const preview3D = useCabinetStore((s) => s.ui.preview3D);
  
  const cabinets = currentProject?.cabinets ?? [];
  const countertops = currentProject?.countertops ?? [];
  
  // Calculate cabinet positions (line them up horizontally)
  const cabinetPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    let currentX = 0;
    
    for (const cabinet of cabinets) {
      const width = cabinet.dimensions.width / 1000;
      positions.push([currentX + width / 2, 0, 0]);
      currentX += width + 0.02; // 20mm gap between cabinets
    }
    
    return positions;
  }, [cabinets]);
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      
      {/* Environment */}
      <Environment preset="apartment" />
      
      {/* Floor Grid */}
      {preview3D?.showGrid && (
        <Grid
          args={[10, 10]}
          position={[0, 0, 0]}
          cellSize={0.1}
          cellThickness={0.5}
          cellColor="#6e6e6e"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={10}
          fadeStrength={1}
        />
      )}
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Cabinets */}
      {cabinets.map((cabinet, index) => (
        <CabinetBox
          key={cabinet.id}
          cabinet={cabinet}
          position={cabinetPositions[index] || [0, 0, 0]}
          isSelected={cabinet.id === selectedCabinetId}
          onClick={() => setSelectedCabinet(cabinet.id)}
        />
      ))}
      
      {/* Countertops */}
      {countertops.map((countertop) => {
        const maxHeight = cabinets.length > 0 ? Math.max(...cabinets.map((c) => c.dimensions.height)) : 720;
        return (
          <Countertop
            key={countertop.id}
            length={countertop.length}
            width={countertop.width || countertop.depth}
            thickness={countertop.thickness}
            position={[countertop.length / 2000, maxHeight / 1000 + countertop.thickness / 2000, 0]}
            color={countertop.materialId ? '#2F4F4F' : '#2F4F4F'}
          />
        );
      })}
      
      {/* Camera Controls */}
      <OrbitControls 
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={0.5}
        maxDistance={10}
      />
    </>
  );
}

// ============================================
// Loading Fallback
// ============================================

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center gap-2 text-gray-600">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>A carregar pré-visualização 3D...</span>
      </div>
    </Html>
  );
}

// ============================================
// Main Preview3D Component
// ============================================

export default function Preview3D() {
  const toggle3DPreview = useCabinetStore((s) => s.toggle3DPreview);
  const preview3D = useCabinetStore((s) => s.ui.preview3D);
  const set3DPreviewOptions = useCabinetStore((s) => s.set3DPreviewOptions);
  
  if (!preview3D?.isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-[90vw] h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Pré-visualização 3D
          </h2>
          
          <div className="flex items-center gap-4">
            {/* View Options */}
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={preview3D.showGrid ?? true}
                onChange={(e) => set3DPreviewOptions({ showGrid: e.target.checked })}
                className="rounded"
              />
              Grelha
            </label>
            
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={preview3D.showDimensions ?? true}
                onChange={(e) => set3DPreviewOptions({ showDimensions: e.target.checked })}
                className="rounded"
              />
              Dimensões
            </label>
            
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={preview3D.showHardware ?? true}
                onChange={(e) => set3DPreviewOptions({ showHardware: e.target.checked })}
                className="rounded"
              />
              Ferragens
            </label>
            
            {/* Close Button */}
            <button
              onClick={() => toggle3DPreview(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 3D Canvas */}
        <div className="flex-1 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          <Canvas shadows dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[2, 2, 3]} fov={50} />
            <Suspense fallback={<LoadingFallback />}>
              <Scene />
            </Suspense>
          </Canvas>
        </div>
        
        {/* Footer with controls */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>🖱️ Arrastar para rodar</span>
              <span>⚙️ Scroll para zoom</span>
              <span>⇧ Shift + arrastar para mover</span>
            </div>
            <div>
              Clique num armário para selecioná-lo
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
