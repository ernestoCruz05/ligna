import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, X } from 'lucide-react';
import { useCabinetStore, useMaterials } from '../store/cabinetStore';
import { cn } from '../utils/cn';
import type { Material } from '../types';

const generateId = () => `mat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const MATERIAL_TYPES = [
  { value: 'mdf', label: 'MDF' },
  { value: 'melamine', label: 'Melamina' },
  { value: 'plywood', label: 'Contraplacado' },
  { value: 'hdf', label: 'HDF' },
  { value: 'edge-banding', label: 'Orla' },
  { value: 'countertop', label: 'Tampo' },
  { value: 'solid-wood', label: 'Madeira Maciça' },
  { value: 'other', label: 'Outro' },
] as const;

interface MaterialFormData {
  name: string;
  type: Material['type'];
  thickness: number;
  pricePerM2: number;
  color: string;
  supplier: string;
  sku: string;
}

const defaultFormData: MaterialFormData = {
  name: '',
  type: 'melamine',
  thickness: 18,
  pricePerM2: 0,
  color: '#D4A574',
  supplier: '',
  sku: '',
};

interface MaterialsPanelProps {
  className?: string;
}

export function MaterialsPanel({ className }: MaterialsPanelProps) {
  const materials = useMaterials();
  const { addMaterial, updateMaterial, deleteMaterial } = useCabinetStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(defaultFormData);
  const [filter, setFilter] = useState<Material['type'] | 'all'>('all');
  
  const filteredMaterials = filter === 'all' 
    ? materials 
    : materials.filter(m => m.type === filter);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const material: Material = {
      id: editingId || generateId(),
      name: formData.name,
      type: formData.type,
      thickness: formData.thickness,
      pricePerM2: formData.pricePerM2,
      color: formData.color,
      supplier: formData.supplier || undefined,
      sku: formData.sku || undefined,
      isAvailable: true,
    };
    
    if (editingId) {
      updateMaterial(editingId, material);
    } else {
      addMaterial(material);
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };
  
  const handleEdit = (material: Material) => {
    setFormData({
      name: material.name,
      type: material.type,
      thickness: material.thickness,
      pricePerM2: material.pricePerM2 || 0,
      color: material.color || '#D4A574',
      supplier: material.supplier || '',
      sku: material.sku || '',
    });
    setEditingId(material.id);
    setShowForm(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que pretende eliminar este material?')) {
      deleteMaterial(id);
    }
  };
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Biblioteca de Materiais
          </h2>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </button>
        </div>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Material['type'] | 'all')}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Todos os tipos</option>
          {MATERIAL_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      
      {/* Materials List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredMaterials.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum material encontrado</p>
          </div>
        ) : (
          filteredMaterials.map(material => (
            <div
              key={material.id}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                    style={{ backgroundColor: material.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {material.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {MATERIAL_TYPES.find(t => t.value === material.type)?.label} • {material.thickness}mm
                      {material.pricePerM2 ? ` • €${material.pricePerM2.toFixed(2)}/m²` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(material)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {material.supplier && (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Fornecedor: {material.supplier}
                  {material.sku ? ` (${material.sku})` : ''}
                </p>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? 'Editar Material' : 'Novo Material'}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="ex: MDF Branco 18mm"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Material['type'] }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {MATERIAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Espessura (mm) *
                  </label>
                  <input
                    type="number"
                    value={formData.thickness}
                    onChange={(e) => setFormData(prev => ({ ...prev, thickness: Number(e.target.value) }))}
                    min={0.5}
                    step={0.5}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço (€/m²)
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerM2}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerM2: Number(e.target.value) }))}
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cor
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="ex: Leroy Merlin"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Referência/SKU
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="ex: MDF-BR-18"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg"
                >
                  {editingId ? 'Guardar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
