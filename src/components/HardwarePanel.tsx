import { useState } from 'react';
import { Plus, Edit2, Trash2, Wrench, X } from 'lucide-react';
import { useCabinetStore, useHardware } from '../store/cabinetStore';
import { cn } from '../utils/cn';
import type { HardwareItem } from '../types';

const generateId = () => `hw-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const HARDWARE_CATEGORIES = [
  { value: 'hinge', label: 'Dobradiças' },
  { value: 'slide', label: 'Corrediças' },
  { value: 'handle', label: 'Puxadores' },
  { value: 'shelf-pin', label: 'Suportes de Prateleira' },
  { value: 'connector', label: 'Conectores' },
  { value: 'screw', label: 'Parafusos' },
  { value: 'leg', label: 'Pés' },
  { value: 'accessory', label: 'Acessórios' },
  { value: 'other', label: 'Outro' },
] as const;

interface HardwareFormData {
  name: string;
  category: HardwareItem['category'];
  brand: string;
  sku: string;
  pricePerUnit: number;
  unitsPerPack: number;
}

const defaultFormData: HardwareFormData = {
  name: '',
  category: 'hinge',
  brand: '',
  sku: '',
  pricePerUnit: 0,
  unitsPerPack: 1,
};

interface HardwarePanelProps {
  className?: string;
}

export function HardwarePanel({ className }: HardwarePanelProps) {
  const hardware = useHardware();
  const { addHardware, updateHardware, deleteHardware } = useCabinetStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<HardwareFormData>(defaultFormData);
  const [filter, setFilter] = useState<HardwareItem['category'] | 'all'>('all');
  
  const filteredHardware = filter === 'all' 
    ? hardware 
    : hardware.filter(h => h.category === filter);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const item: HardwareItem = {
      id: editingId || generateId(),
      name: formData.name,
      type: formData.category === 'slide' ? 'drawer-slide' : formData.category === 'hinge' ? 'hinge' : formData.category === 'handle' ? 'handle' : formData.category === 'shelf-pin' ? 'shelf-pin' : formData.category === 'screw' ? 'screw' : formData.category === 'leg' ? 'leg' : formData.category === 'connector' ? 'connector' : 'other',
      category: formData.category,
      brand: formData.brand || undefined,
      sku: formData.sku || undefined,
      costPerUnit: formData.pricePerUnit,
      pricePerUnit: formData.pricePerUnit,
      unitsPerPack: formData.unitsPerPack,
      isAvailable: true,
    };
    
    if (editingId) {
      updateHardware(editingId, item);
    } else {
      addHardware(item);
    }
    
    resetForm();
  };
  
  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultFormData);
  };
  
  const handleEdit = (item: HardwareItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      brand: item.brand || '',
      sku: item.sku || '',
      pricePerUnit: item.pricePerUnit || 0,
      unitsPerPack: item.unitsPerPack || 1,
    });
    setEditingId(item.id);
    setShowForm(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza que pretende eliminar esta ferragem?')) {
      deleteHardware(id);
    }
  };
  
  // Group hardware by category
  const groupedHardware = filteredHardware.reduce((acc, item) => {
    const cat = item.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, HardwareItem[]>);
  
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Biblioteca de Ferragens
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
          onChange={(e) => setFilter(e.target.value as HardwareItem['category'] | 'all')}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Todas as categorias</option>
          {HARDWARE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      
      {/* Hardware List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.keys(groupedHardware).length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma ferragem encontrada</p>
          </div>
        ) : (
          Object.entries(groupedHardware).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {HARDWARE_CATEGORIES.find(c => c.value === category)?.label || category}
              </h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.brand && `${item.brand} • `}
                          {item.pricePerUnit ? `€${item.pricePerUnit.toFixed(2)}/un` : ''}
                          {item.unitsPerPack && item.unitsPerPack > 1 ? ` (pack de ${item.unitsPerPack})` : ''}
                        </p>
                        {item.sku && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Ref: {item.sku}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                {editingId ? 'Editar Ferragem' : 'Nova Ferragem'}
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
                  placeholder="ex: Dobradiça Soft-Close 110°"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as HardwareItem['category'] }))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {HARDWARE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="ex: Blum, Hettich"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Preço por unidade (€)
                  </label>
                  <input
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerUnit: Number(e.target.value) }))}
                    min={0}
                    step={0.01}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unidades por embalagem
                  </label>
                  <input
                    type="number"
                    value={formData.unitsPerPack}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitsPerPack: Number(e.target.value) }))}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Referência/SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="ex: CLIP-71B3550"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
