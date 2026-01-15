import { useState, useMemo } from 'react';
import { Download, Moon, Sun, FolderPlus, FileText, Menu, Box } from 'lucide-react';
import { useCabinetStore } from '../store/cabinetStore';
import { calculateParts, generateCutListCSV, flattenProjectToCutList, consolidateParts, downloadFile } from '../utils/cabinetLogic';
import { pt } from '../i18n/pt';

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const {
    currentProject,
    patterns,
    globalSettings,
    materials,
    joints,
    ui,
    toggleDarkMode,
    createProject,
    updateProject,
    setIsExporting,
    toggle3DPreview,
  } = useCabinetStore();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectClient, setProjectClient] = useState('');

  // Get default rule set for quick export
  const defaultRuleSet = useMemo(() => {
    const { ruleSets } = useCabinetStore.getState();
    return ruleSets.find(r => r.isDefault) || ruleSets[0];
  }, []);

  const allParts = useMemo(() => {
    if (!currentProject) return [];
    const cabinetsWithParts = currentProject.cabinets.map((cabinet) => {
      const pattern = patterns.find((p) => p.id === cabinet.patternId);
      if (!pattern) return { name: cabinet.name, parts: [] };
      return {
        name: cabinet.name,
        parts: calculateParts(
          pattern,
          cabinet.dimensions,
          globalSettings,
          cabinet.variableOverrides,
          cabinet.zoneProportions,
          defaultRuleSet,
          materials, // Pass materials for thickness resolution
          cabinet.materialOverrides, // Pass instance-level material overrides
          undefined, // edgeBandingId
          joints // Pass joint types for dimension adjustments
        ),
      };
    });
    return flattenProjectToCutList(cabinetsWithParts);
  }, [currentProject, patterns, globalSettings, defaultRuleSet, materials, joints]);

  const handleExportCSV = () => {
    if (!currentProject || allParts.length === 0) {
      alert(pt.cutList.noParts);
      return;
    }
    setIsExporting(true);
    try {
      const csv = generateCutListCSV(allParts, { includeEdgeBanding: true, groupByMaterial: true, includeLabels: true, format: 'cutlist-optimizer', includeHardware: false, includeCosts: false });
      const filename = currentProject.name.replace(/[^a-z0-9]/gi, '_') + '_cutlist_' + new Date().toISOString().split('T')[0] + '.csv';
      downloadFile(csv, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportConsolidatedCSV = () => {
    if (!currentProject || allParts.length === 0) {
      alert(pt.cutList.noParts);
      return;
    }
    setIsExporting(true);
    try {
      const consolidated = consolidateParts(allParts);
      const csv = generateCutListCSV(consolidated, { includeEdgeBanding: true, groupByMaterial: true, includeLabels: false, format: 'cutlist-optimizer', includeHardware: false, includeCosts: false });
      const filename = currentProject.name.replace(/[^a-z0-9]/gi, '_') + '_consolidated_' + new Date().toISOString().split('T')[0] + '.csv';
      downloadFile(csv, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewProject = () => {
    if (projectName.trim()) {
      createProject(projectName.trim(), undefined, projectClient.trim() || undefined);
      setShowProjectModal(false);
      setProjectName('');
      setProjectClient('');
    }
  };

  const handleRenameProject = () => {
    const newName = prompt(pt.project.enterNewName, currentProject?.name);
    if (newName?.trim()) {
      updateProject({ name: newName.trim() });
    }
  };

  return (
    <>
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">{pt.app.name}</span>
          </div>
          {currentProject && (
            <button onClick={handleRenameProject} className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[200px] truncate">{currentProject.name}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowProjectModal(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{pt.header.newProject}</span>
          </button>

          {currentProject && currentProject.cabinets.length > 0 && (
            <>
              {/* 3D Preview Button */}
              <button 
                onClick={() => toggle3DPreview(true)} 
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Pré-visualização 3D"
              >
                <Box className="w-4 h-4" />
                <span className="hidden sm:inline">3D</span>
              </button>

              <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" disabled={ui.isExporting}>
                {ui.isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">{pt.header.export}</span>
              </button>
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-1">
                  <button onClick={handleExportCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="font-medium">{pt.header.exportFullCutList}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{pt.header.exportFullCutListDesc}</div>
                  </button>
                  <button onClick={handleExportConsolidatedCSV} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <div className="font-medium">{pt.header.exportConsolidated}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{pt.header.exportConsolidatedDesc}</div>
                  </button>
                </div>
              </div>
              </div>
            </>
          )}

          <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors" title={ui.isDarkMode ? pt.header.switchToLight : pt.header.switchToDark}>
            {ui.isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pt.project.newProject}</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.project.name} *</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder={pt.project.namePlaceholder} autoFocus className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.project.client}</label>
                <input type="text" value={projectClient} onChange={(e) => setProjectClient(e.target.value)} placeholder={pt.project.clientPlaceholder} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setShowProjectModal(false); setProjectName(''); setProjectClient(''); }} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">{pt.actions.cancel}</button>
              <button onClick={handleNewProject} disabled={!projectName.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg transition-colors">{pt.project.createProject}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
