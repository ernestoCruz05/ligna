import { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronRight,
  Package,
  FolderOpen,
  Settings,
  Library,
  Edit,
  Wrench,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useCabinetStore } from '../store/cabinetStore';
import { cn } from '../utils/cn';
import { pt } from '../i18n/pt';
import { PatternEditor } from './PatternEditor';
import { MaterialsPanel } from './MaterialsPanel';
import { HardwarePanel } from './HardwarePanel';
import { ValidationPanel } from './ValidationPanel';
import RulesPanel from './RulesPanel';
import type { CabinetPattern } from '../types';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const {
    currentProject,
    patterns,
    ui,
    setSelectedCabinet,
    deleteCabinet,
    duplicateCabinet,
    addCabinet,
    createProject,
    setActiveTab,
    addPattern,
    updatePattern,
    deletePattern,
    globalSettings,
    setGlobalSettings,
    resetGlobalSettings,
  } = useCabinetStore();

  const [showPatternPicker, setShowPatternPicker] = useState(false);
  const [showPatternEditor, setShowPatternEditor] = useState(false);
  const [editingPattern, setEditingPattern] = useState<CabinetPattern | undefined>(undefined);

  const selectedCabinetId = ui.selectedCabinetId;

  const patternsByCategory = useMemo(() => {
    return patterns.reduce(
      (acc, pattern) => {
        const category = pattern.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(pattern);
        return acc;
      },
      {} as Record<string, CabinetPattern[]>
    );
  }, [patterns]);

  const handleAddCabinet = (pattern: CabinetPattern) => {
    if (!currentProject) {
      createProject('Projeto Sem Nome');
    }
    addCabinet({
      name: pattern.name + ' ' + ((currentProject?.cabinets.length ?? 0) + 1),
      patternId: pattern.id,
      dimensions: { ...pattern.defaultDimensions },
    });
    setShowPatternPicker(false);
  };

  const handleDeleteCabinet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(pt.messages.confirmDeleteCabinet)) {
      deleteCabinet(id);
    }
  };

  const handleDuplicateCabinet = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateCabinet(id);
  };

  const handleDeletePattern = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(pt.messages.confirmDeletePattern)) {
      deletePattern(id);
    }
  };

  const handleEditPattern = (pattern: CabinetPattern, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPattern(pattern);
    setShowPatternEditor(true);
  };

  const handleSavePattern = (pattern: CabinetPattern) => {
    if (editingPattern) {
      updatePattern(pattern.id, pattern);
    } else {
      addPattern(pattern);
    }
    setShowPatternEditor(false);
    setEditingPattern(undefined);
  };

  const handleCancelPatternEditor = () => {
    setShowPatternEditor(false);
    setEditingPattern(undefined);
  };

  const ensureProject = () => {
    if (!currentProject) {
      createProject('Projeto Sem Nome');
    }
  };

  return (
    <aside className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
      <div className="flex border-b border-gray-200 dark:border-gray-800 flex-wrap">
        <button
          onClick={() => setActiveTab('project')}
          className={cn(
            'flex-1 min-w-[60px] px-2 py-3 text-xs font-medium transition-colors',
            ui.activeTab === 'project'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Package className="w-4 h-4 mx-auto mb-0.5" />
          {pt.nav.project}
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            'flex-1 min-w-[60px] px-2 py-3 text-xs font-medium transition-colors',
            ui.activeTab === 'library'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Library className="w-4 h-4 mx-auto mb-0.5" />
          Modelos
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={cn(
            'flex-1 min-w-[60px] px-2 py-3 text-xs font-medium transition-colors',
            ui.activeTab === 'materials'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Package className="w-4 h-4 mx-auto mb-0.5" />
          Materiais
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={cn(
            'flex-1 min-w-[60px] px-2 py-3 text-xs font-medium transition-colors',
            ui.activeTab === 'hardware'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Wrench className="w-4 h-4 mx-auto mb-0.5" />
          Ferragens
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={cn(
            'flex-1 min-w-[60px] px-2 py-3 text-xs font-medium transition-colors',
            ui.activeTab === 'validation'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <AlertCircle className="w-4 h-4 mx-auto mb-0.5" />
          Validação
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={cn(
            'flex-1 min-w-[60px] px-2 py-3 text-xs font-medium transition-colors',
            ui.activeTab === 'rules'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <BookOpen className="w-4 h-4 mx-auto mb-0.5" />
          {pt.nav.rules}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={cn(
            'flex-1 min-w-[60px] px-2 py-3 text-xs font-medium transition-colors',
            ui.activeTab === 'settings'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
          )}
        >
          <Settings className="w-4 h-4 mx-auto mb-0.5" />
          {pt.nav.settings}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {ui.activeTab === 'project' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="font-semibold text-gray-900 dark:text-white truncate">
                  {currentProject?.name || pt.project.noProject}
                </h2>
              </div>
            </div>

            {currentProject && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {currentProject.cabinets.length} {currentProject.cabinets.length !== 1 ? pt.cabinet.titlePlural.toLowerCase() : pt.cabinet.title.toLowerCase()}
              </p>
            )}

            <button
              onClick={() => { ensureProject(); setShowPatternPicker(true); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mb-4"
            >
              <Plus className="w-4 h-4" />
              {pt.cabinet.addCabinet}
            </button>

            {showPatternPicker && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{pt.cabinet.selectPattern}</h3>
                    <button onClick={() => setShowPatternPicker(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">×</button>
                  </div>
                  <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {Object.entries(patternsByCategory).map(([category, categoryPatterns]) => (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          {pt.categories[category as keyof typeof pt.categories] || category}
                        </h4>
                        <div className="space-y-2">
                          {categoryPatterns.map((pattern) => (
                            <button key={pattern.id} onClick={() => handleAddCabinet(pattern)} className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                              <div className="font-medium text-gray-900 dark:text-white">{pattern.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{pattern.description}</div>
                              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{pt.pattern.defaultDimensions}: {pattern.defaultDimensions.width} × {pattern.defaultDimensions.height} × {pattern.defaultDimensions.depth}mm</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {currentProject?.cabinets.map((cabinet) => {
                const pattern = patterns.find((p) => p.id === cabinet.patternId);
                const isSelected = cabinet.id === selectedCabinetId;
                return (
                  <div key={cabinet.id} onClick={() => setSelectedCabinet(cabinet.id)} className={cn('group relative p-3 rounded-lg border cursor-pointer transition-all', isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50')}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn('font-medium truncate', isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white')}>{cabinet.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{pattern?.name || pt.cabinet.unknownPattern}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cabinet.dimensions.width} × {cabinet.dimensions.height} × {cabinet.dimensions.depth}mm</p>
                      </div>
                      <ChevronRight className={cn('w-5 h-5 flex-shrink-0 transition-colors', isSelected ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400')} />
                    </div>
                    <div className={cn('absolute top-2 right-8 flex gap-1 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
                      <button onClick={(e) => handleDuplicateCabinet(cabinet.id, e)} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title={pt.actions.duplicate}><Copy className="w-4 h-4" /></button>
                      <button onClick={(e) => handleDeleteCabinet(cabinet.id, e)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" title={pt.actions.delete}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                );
              })}
              {(!currentProject || currentProject.cabinets.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">{pt.cabinet.noCabinets}</p>
                  <p className="text-xs mt-1">{pt.cabinet.noCabinetsHint}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {ui.activeTab === 'library' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-white">{pt.pattern.patternLibrary}</h2>
              <button onClick={() => { setEditingPattern(undefined); setShowPatternEditor(true); }} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                {pt.pattern.createPattern}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{patterns.length} {pt.pattern.patternsAvailable}</p>
            {Object.entries(patternsByCategory).map(([category, categoryPatterns]) => (
              <div key={category} className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{pt.categories[category as keyof typeof pt.categories] || category} ({categoryPatterns.length})</h4>
                <div className="space-y-2">
                  {categoryPatterns.map((pattern) => (
                    <div key={pattern.id} className="group p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 relative">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{pattern.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{pattern.zones.length} {pt.pattern.zones} • {pattern.partRules.length} {pt.pattern.partRules}</div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleEditPattern(pattern, e)} className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title={pt.actions.edit}><Edit className="w-4 h-4" /></button>
                        <button onClick={(e) => handleDeletePattern(pattern.id, e)} className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" title={pt.actions.delete}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {ui.activeTab === 'settings' && <SettingsPanel globalSettings={globalSettings} setGlobalSettings={setGlobalSettings} resetGlobalSettings={resetGlobalSettings} />}

        {ui.activeTab === 'materials' && <MaterialsPanel />}

        {ui.activeTab === 'hardware' && <HardwarePanel />}

        {ui.activeTab === 'validation' && <ValidationPanel />}

        {ui.activeTab === 'rules' && <RulesPanel />}
      </div>

      {showPatternEditor && <PatternEditor pattern={editingPattern} onSave={handleSavePattern} onCancel={handleCancelPatternEditor} />}
    </aside>
  );
}

interface SettingsPanelProps {
  globalSettings: { materialThickness: number; backPanelThickness: number; backPanelGrooveDepth: number; defaultEdgeBanding: number; };
  setGlobalSettings: (settings: Partial<SettingsPanelProps['globalSettings']>) => void;
  resetGlobalSettings: () => void;
}

function SettingsPanel({ globalSettings, setGlobalSettings, resetGlobalSettings }: SettingsPanelProps) {
  return (
    <div className="p-4">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{pt.settings.globalSettings}</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.settings.materialThickness}</label>
          <input type="number" value={globalSettings.materialThickness} onChange={(e) => setGlobalSettings({ materialThickness: parseFloat(e.target.value) || 18 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.settings.backPanelThickness}</label>
          <input type="number" value={globalSettings.backPanelThickness} onChange={(e) => setGlobalSettings({ backPanelThickness: parseFloat(e.target.value) || 6 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.settings.backPanelGrooveDepth}</label>
          <input type="number" value={globalSettings.backPanelGrooveDepth} onChange={(e) => setGlobalSettings({ backPanelGrooveDepth: parseFloat(e.target.value) || 10 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{pt.settings.edgeBandingThickness}</label>
          <input type="number" step="0.1" value={globalSettings.defaultEdgeBanding} onChange={(e) => setGlobalSettings({ defaultEdgeBanding: parseFloat(e.target.value) || 0.5 })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <button onClick={resetGlobalSettings} className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">{pt.settings.resetToDefaults}</button>
      </div>
    </div>
  );
}
