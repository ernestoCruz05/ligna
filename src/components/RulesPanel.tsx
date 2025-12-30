// ============================================
// RulesPanel - Excel-like table of construction rules
// ============================================

import { useState, useEffect } from 'react';
import { useCabinetStore, useMaterials } from '../store/cabinetStore';
import type { RuleSet } from '../types';
import { pt } from '../i18n/pt';

const t = pt;

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const now = (): string => new Date().toISOString();

// ============================================
// Modal Component for Editing Rules
// ============================================

interface RuleModalProps {
  isOpen: boolean;
  ruleSet?: RuleSet;
  onSave: (ruleSet: RuleSet) => void;
  onClose: () => void;
}

function RuleModal({ isOpen, ruleSet, onSave, onClose }: RuleModalProps) {
  const materials = useMaterials();
  const isNew = !ruleSet;
  
  const [formData, setFormData] = useState<RuleSet>(() => ruleSet || createEmptyRuleSet());

  // Reset form when ruleSet changes
  useEffect(() => {
    setFormData(ruleSet || createEmptyRuleSet());
  }, [ruleSet, isOpen]);

  if (!isOpen) return null;

  function createEmptyRuleSet(): RuleSet {
    return {
      id: generateId(),
      name: '',
      description: '',
      isDefault: false,
      construction: {
        sideConstruction: 'sides-on-bottom',
        backPanelMethod: 'overlay',
        drawerConstruction: 'sides-on-bottom',
      },
      materials: {},
      offsets: {
        drawerFrontGap: 3,
        doorGap: 2,
        shelfInset: 20,
        drawerSlideOffset: 12.7,
        backPanelThickness: 3,
        backGrooveDepth: 8,
      },
      edgeBanding: {
        carcassEdges: ['front'],
        shelfEdges: ['front'],
        doorEdges: ['all'],
        drawerFrontEdges: ['all'],
      },
      createdAt: now(),
      updatedAt: now(),
    };
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor, introduza um nome para o conjunto de regras.');
      return;
    }
    onSave({
      ...formData,
      updatedAt: now(),
    });
  };

  const updateConstruction = (key: keyof RuleSet['construction'], value: string) => {
    setFormData(prev => ({
      ...prev,
      construction: { ...prev.construction, [key]: value },
    }));
  };

  const updateOffsets = (key: keyof RuleSet['offsets'], value: number) => {
    setFormData(prev => ({
      ...prev,
      offsets: { ...prev.offsets, [key]: value },
    }));
  };

  const updateMaterials = (key: keyof RuleSet['materials'], value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      materials: { ...prev.materials, [key]: value || undefined },
    }));
  };

  const toggleEdge = (category: keyof RuleSet['edgeBanding'], edge: string) => {
    setFormData(prev => {
      const edges = prev.edgeBanding[category] as string[];
      const newEdges = edges.includes(edge)
        ? edges.filter(e => e !== edge)
        : [...edges, edge];
      return {
        ...prev,
        edgeBanding: { ...prev.edgeBanding, [category]: newEdges },
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isNew ? 'Novo Conjunto de Regras' : 'Editar Conjunto de Regras'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info & Construction */}
            <div className="space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 pb-2">
                  Informação Básica
                </h3>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t.rules.ruleSetName}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ex: Europeu Padrão"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t.rules.ruleSetDescription}</label>
                  <input
                    type="text"
                    value={formData.description || ''}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição opcional..."
                  />
                </div>
              </div>

              {/* Construction Method */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 pb-2">
                  {t.rules.construction.title}
                </h3>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t.rules.construction.sideConstruction}</label>
                  <select
                    value={formData.construction.sideConstruction}
                    onChange={e => updateConstruction('sideConstruction', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sides-on-bottom">{t.rules.construction.sidesOnBottom}</option>
                    <option value="bottom-between-sides">{t.rules.construction.bottomBetweenSides}</option>
                    <option value="all-between">{t.rules.construction.allBetween}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t.rules.construction.backPanelMethod}</label>
                  <select
                    value={formData.construction.backPanelMethod}
                    onChange={e => updateConstruction('backPanelMethod', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="overlay">{t.rules.construction.overlay}</option>
                    <option value="inset-groove">{t.rules.construction.insetGroove}</option>
                    <option value="inset-rebate">{t.rules.construction.insetRebate}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{t.rules.construction.drawerConstruction}</label>
                  <select
                    value={formData.construction.drawerConstruction}
                    onChange={e => updateConstruction('drawerConstruction', e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sides-on-bottom">{t.rules.construction.drawerSidesOnBottom}</option>
                    <option value="bottom-in-groove">{t.rules.construction.bottomInGroove}</option>
                  </select>
                </div>
              </div>

              {/* Default Materials */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 pb-2">
                  {t.rules.materials.title}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['carcassMaterialId', t.rules.materials.carcass],
                    ['frontMaterialId', t.rules.materials.front],
                    ['backMaterialId', t.rules.materials.back],
                    ['drawerMaterialId', t.rules.materials.drawer],
                    ['shelfMaterialId', t.rules.materials.shelf],
                  ] as const).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                      <select
                        value={formData.materials[key] || ''}
                        onChange={e => updateMaterials(key, e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">--</option>
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Offsets & Edge Banding */}
            <div className="space-y-5">
              {/* Offsets */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 pb-2">
                  {t.rules.offsets.title}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['drawerFrontGap', t.rules.offsets.drawerFrontGap],
                    ['doorGap', t.rules.offsets.doorGap],
                    ['shelfInset', t.rules.offsets.shelfInset],
                    ['drawerSlideOffset', t.rules.offsets.drawerSlideOffset],
                    ['backPanelThickness', t.rules.offsets.backPanelThickness],
                    ['backGrooveDepth', t.rules.offsets.backGrooveDepth],
                  ] as const).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.offsets[key]}
                          onChange={e => updateOffsets(key, parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-2 py-1.5 pr-8 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          step="0.5"
                          min="0"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">mm</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Edge Banding */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 pb-2">
                  {t.rules.edgeBanding.title}
                </h3>
                
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t.rules.edgeBanding.carcassEdges}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['front', 'back', 'top', 'bottom'] as const).map(edge => (
                      <button
                        key={edge}
                        type="button"
                        onClick={() => toggleEdge('carcassEdges', edge)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          (formData.edgeBanding.carcassEdges as string[]).includes(edge)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'
                        }`}
                      >
                        {t.rules.edgeBanding[edge]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t.rules.edgeBanding.shelfEdges}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['front', 'back', 'left', 'right'] as const).map(edge => (
                      <button
                        key={edge}
                        type="button"
                        onClick={() => toggleEdge('shelfEdges', edge)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          (formData.edgeBanding.shelfEdges as string[]).includes(edge)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'
                        }`}
                      >
                        {t.rules.edgeBanding[edge]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">{t.rules.edgeBanding.doorEdges}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(['all', 'front-only'] as const).map(edge => (
                      <button
                        key={edge}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            edgeBanding: { ...prev.edgeBanding, doorEdges: [edge] },
                          }));
                        }}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          (formData.edgeBanding.doorEdges as string[]).includes(edge)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-500'
                        }`}
                      >
                        {edge === 'all' ? t.rules.edgeBanding.all : t.rules.edgeBanding.frontOnly}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
          >
            {t.actions.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {t.actions.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Main RulesPanel Component
// ============================================

export default function RulesPanel() {
  const { ruleSets, addRuleSet, updateRuleSet, deleteRuleSet } = useCabinetStore();
  const [editingRuleSet, setEditingRuleSet] = useState<RuleSet | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSave = (ruleSet: RuleSet) => {
    if (editingRuleSet) {
      updateRuleSet(ruleSet.id, ruleSet);
    } else {
      addRuleSet(ruleSet);
    }
    setIsModalOpen(false);
    setEditingRuleSet(null);
  };

  const handleEdit = (ruleSet: RuleSet) => {
    setEditingRuleSet(ruleSet);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingRuleSet(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (ruleSets.length <= 1) {
      alert('Deve existir pelo menos um conjunto de regras.');
      return;
    }
    if (confirm('Tem a certeza que pretende eliminar este conjunto de regras?')) {
      deleteRuleSet(id);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingRuleSet(null);
  };

  // Get translated labels for construction methods
  const getSideConstructionLabel = (value: string) => {
    switch (value) {
      case 'sides-on-bottom': return t.rules.construction.sidesOnBottom;
      case 'bottom-between-sides': return t.rules.construction.bottomBetweenSides;
      case 'all-between': return t.rules.construction.allBetween;
      default: return value;
    }
  };

  const getBackPanelLabel = (value: string) => {
    switch (value) {
      case 'overlay': return t.rules.construction.overlay;
      case 'inset-groove': return t.rules.construction.insetGroove;
      case 'inset-rebate': return t.rules.construction.insetRebate;
      default: return value;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
            {t.rules.title}
          </h2>
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t.rules.newRuleSet}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t.rules.description}
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ilhargas
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Traseira
              </th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {ruleSets.map(ruleSet => (
              <tr
                key={ruleSet.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                onDoubleClick={() => handleEdit(ruleSet)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {ruleSet.name}
                    </span>
                    {ruleSet.isDefault && (
                      <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded font-medium">
                        Padrão
                      </span>
                    )}
                  </div>
                  {ruleSet.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[150px]">
                      {ruleSet.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                  {getSideConstructionLabel(ruleSet.construction.sideConstruction)}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-xs">
                  {getBackPanelLabel(ruleSet.construction.backPanelMethod)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(ruleSet); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(ruleSet.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ruleSets.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {t.cutList.modal.noRuleSets}
            </p>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t.rules.newRuleSet}
            </button>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          Duplo clique numa linha para editar
        </p>
      </div>

      {/* Modal */}
      <RuleModal
        isOpen={isModalOpen}
        ruleSet={editingRuleSet || undefined}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
}
