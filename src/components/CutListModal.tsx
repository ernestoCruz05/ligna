// ============================================
// CutListModal - Generate cut list with rule selection
// ============================================

import { useState, useMemo } from 'react';
import { useCabinetStore, useCurrentProject, useGlobalSettings } from '../store/cabinetStore';
import { calculateParts } from '../utils/cabinetLogic';
import type { CutPart } from '../types';
import { pt } from '../i18n/pt';
import ChartaConfigModal from './ChartaConfigModal';
import {
  isChartaConfigured,
  fetchChartaProjects,
  uploadToCharta,
  generateCutListCSV,
  svgToPng,
  getCabinetVisualizerSvg,
  type ChartaProject,
} from '../services/chartaApi';

const t = pt;

interface ExportOptions {
  includeEdgeBanding: boolean;
  includeHardware: boolean;
  includeCosts: boolean;
  groupByMaterial: boolean;
}

interface CutListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CutListTable({ parts, groupByMaterial }: { parts: CutPart[]; groupByMaterial: boolean }) {
  const consolidatedParts = useMemo(() => {
    const map = new Map<string, CutPart & { count: number }>();
    
    for (const part of parts) {
      const key = `${part.partName}-${part.length}-${part.width}-${part.materialId || 'default'}`;
      const existing = map.get(key);
      if (existing) {
        existing.count += part.quantity;
      } else {
        map.set(key, { ...part, count: part.quantity });
      }
    }
    
    return Array.from(map.values());
  }, [parts]);

  const groupedParts = useMemo(() => {
    if (!groupByMaterial) {
      return { 'Todas as Peças': consolidatedParts };
    }
    
    const groups: Record<string, (CutPart & { count: number })[]> = {};
    for (const part of consolidatedParts) {
      const material = part.materialId || 'default';
      if (!groups[material]) {
        groups[material] = [];
      }
      groups[material].push(part);
    }
    return groups;
  }, [consolidatedParts, groupByMaterial]);

  const totalParts = consolidatedParts.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="space-y-4">
      {Object.entries(groupedParts).map(([groupName, groupParts]) => (
        <div key={groupName}>
          {groupByMaterial && (
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 border-b border-gray-200 dark:border-gray-600 pb-1">
              {groupName === 'default' ? 'Material Padrão' : groupName}
            </h4>
          )}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 text-xs uppercase">
                <th className="py-2 pr-2">{t.cutList.part}</th>
                <th className="py-2 px-2 text-right">{t.cutList.length}</th>
                <th className="py-2 px-2 text-right">{t.cutList.width}</th>
                <th className="py-2 pl-2 text-right">{t.cutList.quantity}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {groupParts.map((part, idx) => (
                <tr key={idx} className="text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-2 pr-2 font-medium">{part.partName}</td>
                  <td className="py-2 px-2 text-right font-mono">{part.length.toFixed(1)}</td>
                  <td className="py-2 px-2 text-right font-mono">{part.width.toFixed(1)}</td>
                  <td className="py-2 pl-2 text-right font-mono">{part.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Total</span>
        <span className="text-gray-900 dark:text-white font-medium">{totalParts} {t.cutList.totalParts}</span>
      </div>
    </div>
  );
}

export default function CutListModal({ isOpen, onClose }: CutListModalProps) {
  const { ruleSets, ui, patterns } = useCabinetStore();
  const project = useCurrentProject();
  const globalSettings = useGlobalSettings();
  
  const [selectedRuleSetId, setSelectedRuleSetId] = useState<string>(
    ui.cutListModal.selectedRuleSetId || ruleSets[0]?.id || ''
  );
  const [isGenerated, setIsGenerated] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeEdgeBanding: false,
    includeHardware: false,
    includeCosts: false,
    groupByMaterial: false,
  });

  // Charta integration state
  const [showChartaConfig, setShowChartaConfig] = useState(false);
  const [chartaConfigured, setChartaConfigured] = useState(isChartaConfigured());
  const [chartaProjects, setChartaProjects] = useState<ChartaProject[]>([]);
  const [selectedChartaProject, setSelectedChartaProject] = useState<string>('');
  const [isExportingToCharta, setIsExportingToCharta] = useState(false);
  const [chartaExportResult, setChartaExportResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [chartaExportOptions, setChartaExportOptions] = useState({
    exportCutList: true,
    exportSketch: true,
  });

  const selectedRuleSet = ruleSets.find(r => r.id === selectedRuleSetId);

  // Fetch Charta projects when modal opens and Charta is configured
  useMemo(() => {
    if (isOpen && chartaConfigured) {
      fetchChartaProjects()
        .then(setChartaProjects)
        .catch(() => setChartaProjects([]));
    }
  }, [isOpen, chartaConfigured]);

  const parts = useMemo(() => {
    if (!project?.cabinets || !isGenerated || !selectedRuleSet) return [];
    
    const allParts: CutPart[] = [];
    for (const cabinet of project.cabinets) {
      const pattern = patterns.find(p => p.id === cabinet.patternId);
      if (!pattern) continue;
      const cabinetParts = calculateParts(
        pattern, 
        cabinet.dimensions, 
        globalSettings, 
        cabinet.variableOverrides, 
        cabinet.zoneProportions,
        selectedRuleSet // Now passing the selected rule set for construction-aware calculations
      );
      // Add cabinet name to each part for grouping
      allParts.push(...cabinetParts.map(p => ({ ...p, cabinetName: cabinet.name })));
    }
    return allParts;
  }, [project, globalSettings, isGenerated, patterns, selectedRuleSet]);

  const handleGenerate = () => {
    if (!selectedRuleSet) return;
    setIsGenerated(true);
  };

  const handleExportCSV = () => {
    if (parts.length === 0) return;
    
    // Build CSV content
    const headers = ['Peça', 'Comprimento (mm)', 'Largura (mm)', 'Quantidade'];
    const rows = parts.map(p => [p.partName, p.length.toFixed(1), p.width.toFixed(1), p.quantity.toString()]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lista-corte-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExportToCharta = async () => {
    if (parts.length === 0 && !chartaExportOptions.exportSketch) return;
    if (!chartaExportOptions.exportCutList && !chartaExportOptions.exportSketch) return;

    setIsExportingToCharta(true);
    setChartaExportResult(null);

    try {
      const projectName = project?.name || 'Sem nome';
      const dateStr = new Date().toISOString().split('T')[0];
      const safeProjectName = projectName.replace(/\s+/g, '-');
      let uploadCount = 0;

      // Export cut list CSV
      if (chartaExportOptions.exportCutList && parts.length > 0) {
        const csvBlob = generateCutListCSV(parts);
        const csvFilename = `lista-corte-${safeProjectName}-${dateStr}.csv`;
        await uploadToCharta(csvBlob, csvFilename, selectedChartaProject || undefined);
        uploadCount++;
      }

      // Export 2D sketch as PNG
      if (chartaExportOptions.exportSketch) {
        const svgElement = getCabinetVisualizerSvg();
        if (svgElement) {
          try {
            const pngBlob = await svgToPng(svgElement, 2);
            const pngFilename = `esboço-${safeProjectName}-${dateStr}.png`;
            await uploadToCharta(pngBlob, pngFilename, selectedChartaProject || undefined);
            uploadCount++;
          } catch (sketchError) {
            console.warn('Could not export sketch:', sketchError);
            // Continue with just the cut list if sketch fails
          }
        }
      }

      if (uploadCount > 0) {
        const message = uploadCount === 1 
          ? t.charta.exportSuccess 
          : `${uploadCount} ficheiros enviados com sucesso!`;
        setChartaExportResult({ ok: true, message });
      } else {
        setChartaExportResult({ ok: false, message: 'Nenhum ficheiro para exportar' });
      }
    } catch (error) {
      setChartaExportResult({
        ok: false,
        message: error instanceof Error ? error.message : t.charta.exportFailed,
      });
    } finally {
      setIsExportingToCharta(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {/* Modal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t.cutList.modal.title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rule Set Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.cutList.modal.selectRuleSet}
            </label>
            <select
              value={selectedRuleSetId}
              onChange={(e) => {
                setSelectedRuleSetId(e.target.value);
                setIsGenerated(false);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ruleSets.length === 0 ? (
                <option value="">{t.cutList.modal.noRuleSets}</option>
              ) : (
                ruleSets.map(rs => (
                  <option key={rs.id} value={rs.id}>
                    {rs.name} {rs.isDefault ? '(Padrão)' : ''}
                  </option>
                ))
              )}
            </select>
            {selectedRuleSet && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {selectedRuleSet.description || 
                  `${selectedRuleSet.construction.sideConstruction === 'sides-on-bottom' ? 'Ilhargas sobre fundo' : 'Fundo entre ilhargas'}, ` +
                  `Traseira ${selectedRuleSet.construction.backPanelMethod === 'overlay' ? 'sobreposta' : 'em ranhura'}`
                }
              </p>
            )}
          </div>

          {/* Export Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t.cutList.modal.includeOptions}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'includeEdgeBanding', label: t.cutList.modal.includeEdgeBanding },
                { key: 'includeHardware', label: t.cutList.modal.includeHardware },
                { key: 'includeCosts', label: t.cutList.modal.includeCosts },
                { key: 'groupByMaterial', label: t.cutList.modal.groupByMaterial },
              ].map(({ key, label }) => {
                const isChecked = exportOptions[key as keyof ExportOptions];
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
                  >
                    <div className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                      isChecked 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'bg-white dark:bg-transparent border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400'
                    }`}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="sr-only"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-200">{label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Generated Cut List */}
          {isGenerated && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.cutList.preview}
                </h3>
                {parts.length > 0 && (
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs font-medium transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Exportar CSV
                  </button>
                )}
              </div>
              
              {parts.length > 0 ? (
                <CutListTable parts={parts} groupByMaterial={exportOptions.groupByMaterial} />
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {t.cutList.noParts}
                </p>
              )}

              {/* Charta Export Section */}
              {parts.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t.charta.title}
                      </h3>
                    </div>
                    {!chartaConfigured && (
                      <button
                        onClick={() => setShowChartaConfig(true)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t.charta.configure}
                      </button>
                    )}
                  </div>

                  {chartaConfigured ? (
                    <div className="space-y-3">
                      {/* Project Selector */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                          {t.charta.selectProject}
                        </label>
                        <select
                          value={selectedChartaProject}
                          onChange={(e) => setSelectedChartaProject(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">{t.charta.selectProjectPlaceholder}</option>
                          {chartaProjects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Export Options */}
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chartaExportOptions.exportCutList}
                            onChange={(e) => setChartaExportOptions(prev => ({ ...prev, exportCutList: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Lista de Corte</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chartaExportOptions.exportSketch}
                            onChange={(e) => setChartaExportOptions(prev => ({ ...prev, exportSketch: e.target.checked }))}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Esboço 2D</span>
                        </label>
                      </div>

                      {/* Export Result */}
                      {chartaExportResult && (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          chartaExportResult.ok 
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {chartaExportResult.ok ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {chartaExportResult.message}
                        </div>
                      )}

                      {/* Export Button */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportToCharta}
                          disabled={isExportingToCharta}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
                        >
                          {isExportingToCharta ? (
                            <>
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              {t.charta.exporting}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              {t.charta.exportCutList}
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setShowChartaConfig(true)}
                          className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={t.charta.configure}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                        {t.charta.notConfigured}
                      </p>
                      <button
                        onClick={() => setShowChartaConfig(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {t.charta.configure}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {t.cutList.modal.cancelBtn}
          </button>
          <button
            onClick={handleGenerate}
            disabled={!selectedRuleSet || ruleSets.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {t.cutList.modal.generateBtn}
          </button>
        </div>
      </div>

      {/* Charta Config Modal */}
      <ChartaConfigModal
        isOpen={showChartaConfig}
        onClose={() => setShowChartaConfig(false)}
        onConfigured={() => {
          setChartaConfigured(true);
          fetchChartaProjects()
            .then(setChartaProjects)
            .catch(() => setChartaProjects([]));
        }}
      />
    </div>
  );
}
