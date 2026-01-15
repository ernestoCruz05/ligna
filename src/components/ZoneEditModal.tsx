import { useState, useEffect, useCallback } from 'react';
import type { PatternZone, GlobalSettings } from '../types';

interface ZoneEditModalProps {
  isOpen: boolean;
  zone: PatternZone | null;
  /** Actual height in mm (calculated from proportion) */
  actualHeight: number;
  /** Actual width in mm (for column-based zones) */
  actualWidth?: number;
  /** The proportion this zone takes (0-1) */
  proportion: number;
  /** Total internal height available in mm */
  totalInternalHeight: number;
  /** Total internal width available in mm */
  totalInternalWidth?: number;
  globalSettings: GlobalSettings;
  onClose: () => void;
  /** Called when height is changed via absolute value input */
  onHeightChange: (newHeightMm: number) => void;
  /** Called when zone properties are updated (name, etc.) */
  onZoneUpdate?: (updates: Partial<PatternZone>) => void;
}

export function ZoneEditModal({
  isOpen,
  zone,
  actualHeight,
  actualWidth,
  proportion,
  totalInternalHeight,
  totalInternalWidth,
  globalSettings,
  onClose,
  onHeightChange,
  onZoneUpdate,
}: ZoneEditModalProps) {
  const [heightInput, setHeightInput] = useState('');
  const [widthInput, setWidthInput] = useState('');
  const [nameInput, setNameInput] = useState('');

  // Sync inputs with zone data when modal opens or zone changes
  useEffect(() => {
    if (zone && isOpen) {
      setHeightInput(String(actualHeight));
      setWidthInput(actualWidth ? String(actualWidth) : '');
      setNameInput(zone.name);
    }
  }, [zone, isOpen, actualHeight, actualWidth]);

  const handleHeightSubmit = useCallback(() => {
    const newHeight = parseInt(heightInput, 10);
    if (!isNaN(newHeight) && newHeight > 0) {
      // Enforce minimum height based on zone type
      const minHeight = zone?.type === 'drawer' ? 80 : 50;
      const maxHeight = totalInternalHeight - 50; // Leave at least 50mm for other zones
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      onHeightChange(clampedHeight);
    }
  }, [heightInput, totalInternalHeight, zone?.type, onHeightChange]);

  const handleNameSubmit = useCallback(() => {
    if (onZoneUpdate && nameInput.trim()) {
      onZoneUpdate({ name: nameInput.trim() });
    }
  }, [nameInput, onZoneUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, submitFn: () => void) => {
    if (e.key === 'Enter') {
      submitFn();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen || !zone) return null;

  const zoneTypeLabels: Record<string, string> = {
    drawer: 'Gaveta',
    door: 'Porta',
    shelf: 'Prateleira',
    'fixed-shelf': 'Prateleira Fixa',
    opening: 'Abertura',
    divider: 'Divisória',
    'appliance-space': 'Espaço Eletro',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 max-w-[90vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Editar Zona
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {zoneTypeLabels[zone.type] || zone.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Zone Name */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => handleKeyDown(e, handleNameSubmit)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Height */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Altura ({globalSettings.units})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                onBlur={handleHeightSubmit}
                onKeyDown={(e) => handleKeyDown(e, handleHeightSubmit)}
                min={50}
                max={totalInternalHeight - 50}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                ({Math.round(proportion * 100)}%)
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Min: 50mm • Max: {totalInternalHeight - 50}mm
            </p>
          </div>

          {/* Width (if applicable) */}
          {actualWidth !== undefined && totalInternalWidth !== undefined && (
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Largura ({globalSettings.units})
              </label>
              <input
                type="number"
                value={widthInput}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md 
                           bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Largura é controlada pela coluna
              </p>
            </div>
          )}

          {/* Zone-specific options */}
          {zone.type === 'drawer' && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Opções de Gaveta
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Offset Corrediça:</span>
                  <span>{zone.options?.drawerSlideOffset ?? 12.5}mm</span>
                </div>
              </div>
            </div>
          )}

          {zone.type === 'door' && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Opções de Porta
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Dobradiça:</span>
                  <span>{zone.options?.hingeType === 'double' ? 'Dupla' : 
                         zone.options?.hingeType === 'right' ? 'Direita' : 'Esquerda'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sobreposição:</span>
                  <span>{zone.options?.doorOverlay ?? 2}mm</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Fechar
          </button>
          <button
            onClick={() => {
              handleHeightSubmit();
              handleNameSubmit();
              onClose();
            }}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}
