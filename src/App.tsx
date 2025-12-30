import { useMemo, useState, useEffect, useCallback } from 'react';
import { useCabinetStore } from './store/cabinetStore';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CabinetVisualizer } from './components/CabinetVisualizer';
import Preview3D from './components/Preview3D';
import './App.css';

function App() {
  const {
    currentProject,
    patterns,
    globalSettings,
    ui,
    updateCabinet,
  } = useCabinetStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get selected cabinet and its pattern
  const selectedCabinet = useMemo(() => {
    if (!ui.selectedCabinetId || !currentProject) return null;
    return currentProject.cabinets.find((c) => c.id === ui.selectedCabinetId) ?? null;
  }, [ui.selectedCabinetId, currentProject]);

  const selectedPattern = useMemo(() => {
    if (!selectedCabinet) return null;
    return patterns.find((p) => p.id === selectedCabinet.patternId) ?? null;
  }, [selectedCabinet, patterns]);

  // Handle zone proportions change from visualizer drag
  const handleZoneProportionsChange = useCallback((proportions: number[]) => {
    if (selectedCabinet) {
      updateCabinet(selectedCabinet.id, { zoneProportions: proportions });
    }
  }, [selectedCabinet, updateCabinet]);

  // Apply dark mode class to document
  useEffect(() => {
    if (ui.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [ui.isDarkMode]);

  // Close mobile sidebar when selecting a cabinet
  useEffect(() => {
    if (ui.selectedCabinetId) {
      setSidebarOpen(false);
    }
  }, [ui.selectedCabinetId]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden">
      {/* Header */}
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
          <Sidebar className="h-full" />
        </aside>

        {/* Center - Visualizer */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 overflow-hidden">
          {/* Visualizer Container */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <CabinetVisualizer
              pattern={selectedPattern}
              cabinet={selectedCabinet}
              dimensions={selectedCabinet?.dimensions ?? { height: 720, width: 600, depth: 560 }}
              globalSettings={globalSettings}
              onZoneProportionsChange={handleZoneProportionsChange}
              className="w-full h-full"
            />
          </div>

          {/* Status Bar */}
          <div className="h-8 px-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div>
              {currentProject ? (
                <>
                  <span className="font-medium">{currentProject.cabinets.length}</span> cabinet
                  {currentProject.cabinets.length !== 1 ? 's' : ''} in project
                </>
              ) : (
                'No project open'
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>Material: {globalSettings.materialThickness}mm</span>
              <span>
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </main>

        {/* Right Panel - Properties */}
        <aside className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
          <PropertiesPanel className="h-full" />
        </aside>
      </div>

      {/* 3D Preview Modal */}
      <Preview3D />
    </div>
  );
}

export default App;
