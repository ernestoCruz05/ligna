import { useMemo } from 'react';
import { useCabinetStore } from '../store/cabinetStore';
import { cn } from '../utils/cn';
import { pt } from '../i18n/pt';
import CutListModal from './CutListModal';

interface PropertiesPanelProps {
  className?: string;
}

export function PropertiesPanel({ className }: PropertiesPanelProps) {
  const { currentProject, patterns, ui, updateCabinet, openCutListModal, closeCutListModal } = useCabinetStore();

  const selectedCabinet = useMemo(() => {
    if (!ui.selectedCabinetId || !currentProject) return null;
    return currentProject.cabinets.find((c) => c.id === ui.selectedCabinetId) ?? null;
  }, [ui.selectedCabinetId, currentProject]);

  const selectedPattern = useMemo(() => {
    if (!selectedCabinet) return null;
    return patterns.find((p) => p.id === selectedCabinet.patternId) ?? null;
  }, [selectedCabinet, patterns]);

  const handleDimensionChange = (dimension: 'height' | 'width' | 'depth', value: string) => {
    if (!selectedCabinet) return;
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0) return;
    updateCabinet(selectedCabinet.id, { dimensions: { ...selectedCabinet.dimensions, [dimension]: numValue } });
  };

  const handleNameChange = (name: string) => {
    if (!selectedCabinet) return;
    updateCabinet(selectedCabinet.id, { name });
  };

  const handleNotesChange = (notes: string) => {
    if (!selectedCabinet) return;
    updateCabinet(selectedCabinet.id, { notes });
  };

  const handleLocationChange = (location: string) => {
    if (!selectedCabinet) return;
    updateCabinet(selectedCabinet.id, { location });
  };

  if (!selectedCabinet) {
    return (
      <aside className={cn('flex flex-col h-full bg-white dark:bg-gray-900', className)}>
        <div className="flex items-center justify-center h-full text-center p-8">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="text-sm">{pt.properties.selectCabinet}</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn('flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-gray-900 dark:text-white">{pt.properties.title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPattern?.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{pt.cabinet.cabinetName}</label>
          <input type="text" value={selectedCabinet.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{pt.properties.dimensions}</label>
          <div className="space-y-3">
            <div className="relative">
              <label className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">A</label>
              <input type="number" value={selectedCabinet.dimensions.height} onChange={(e) => handleDimensionChange('height', e.target.value)} className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right" min={100} max={3000} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">mm</span>
            </div>
            <div className="relative">
              <label className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">L</label>
              <input type="number" value={selectedCabinet.dimensions.width} onChange={(e) => handleDimensionChange('width', e.target.value)} className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right" min={100} max={2000} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">mm</span>
            </div>
            <div className="relative">
              <label className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">P</label>
              <input type="number" value={selectedCabinet.dimensions.depth} onChange={(e) => handleDimensionChange('depth', e.target.value)} className="w-full pl-8 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-right" min={100} max={1000} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500">mm</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[{ label: '600×720', w: 600, h: 720, d: 560 }, { label: '800×720', w: 800, h: 720, d: 560 }, { label: '400×720', w: 400, h: 720, d: 320 }].map((preset) => (
              <button key={preset.label} onClick={() => updateCabinet(selectedCabinet.id, { dimensions: { width: preset.w, height: preset.h, depth: preset.d } })} className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">{preset.label}</button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{pt.properties.location}</label>
          <input type="text" value={selectedCabinet.location || ''} onChange={(e) => handleLocationChange(e.target.value)} placeholder={pt.properties.locationPlaceholder} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{pt.properties.notes}</label>
          <textarea value={selectedCabinet.notes || ''} onChange={(e) => handleNotesChange(e.target.value)} placeholder={pt.properties.notesPlaceholder} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" />
        </div>

        <div className="p-4">
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{pt.cutList.title}</label>
          <button
            onClick={() => openCutListModal()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {pt.cutList.generate}
          </button>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">{pt.cutList.selectRulesDesc}</p>
        </div>
      </div>

      {/* Cut List Modal */}
      <CutListModal isOpen={ui.cutListModal.isOpen} onClose={closeCutListModal} />
    </aside>
  );
}
