import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  GlobalSettings,
  CabinetPattern,
  CabinetInstance,
  Project,
  UIState,
  Material,
  HardwareItem,
  Countertop,
  ValidationResult,
  ValidationMessage,
  InsertedElement,
  RuleSet,
} from '../types';
import { defaultPatterns } from '../data/defaultPatterns';
import { defaultMaterials } from '../data/defaultMaterials';
import { defaultHardware } from '../data/defaultHardware';
import { DEFAULT_VALIDATION_LIMITS } from '../types';

// ============================================
// Default Values
// ============================================

const defaultGlobalSettings: GlobalSettings = {
  materialThickness: 18,
  backPanelThickness: 6,
  backPanelGrooveDepth: 10,
  defaultEdgeBanding: 0.5,
  drawerBottomInset: 50,
  units: 'mm',
};

const defaultUIState: UIState = {
  selectedCabinetId: null,
  isDarkMode: true,
  sidebarWidth: 280,
  propertiesPanelWidth: 320,
  isExporting: false,
  activeTab: 'project',
  preview3D: {
    isOpen: false,
    showDoors: true,
    showDrawers: true,
    showCountertop: true,
    showGrid: true,
    showDimensions: true,
    showHardware: true,
  },
  cutListModal: {
    isOpen: false,
    selectedRuleSetId: undefined,
  },
};

// Default Rule Set
const defaultRuleSet: RuleSet = {
  id: 'default-european',
  name: 'Europeu Padrão',
  description: 'Construção europeia: laterais sobre base, traseira sobreposta',
  isDefault: true,
  construction: {
    sideConstruction: 'sides-on-bottom',
    backPanelMethod: 'overlay',
    drawerConstruction: 'sides-on-bottom',
  },
  materials: {},
  offsets: {
    drawerFrontGap: 3,
    doorGap: 3,
    shelfInset: 20,
    drawerSlideOffset: 12.5,
    backPanelThickness: 3,
    backGrooveDepth: 10,
  },
  edgeBanding: {
    carcassEdges: ['front'],
    shelfEdges: ['front'],
    doorEdges: ['all'],
    drawerFrontEdges: ['all'],
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ============================================
// Validation Helper
// ============================================

function validateCabinet(
  cabinet: CabinetInstance,
  pattern: CabinetPattern | undefined
): ValidationResult {
  const errors: ValidationMessage[] = [];
  const warnings: ValidationMessage[] = [];
  const info: ValidationMessage[] = [];
  const limits = DEFAULT_VALIDATION_LIMITS;

  // Cabinet dimension checks
  if (cabinet.dimensions.width < limits.cabinet.minWidth) {
    errors.push({
      ruleId: 'cabinet-min-width',
      ruleName: 'Largura Mínima',
      message: `Largura (${cabinet.dimensions.width}mm) é menor que o mínimo (${limits.cabinet.minWidth}mm)`,
      field: 'width',
      currentValue: cabinet.dimensions.width,
      suggestedValue: limits.cabinet.minWidth,
    });
  }
  if (cabinet.dimensions.width > limits.cabinet.maxWidth) {
    errors.push({
      ruleId: 'cabinet-max-width',
      ruleName: 'Largura Máxima',
      message: `Largura (${cabinet.dimensions.width}mm) excede o máximo (${limits.cabinet.maxWidth}mm)`,
      field: 'width',
      currentValue: cabinet.dimensions.width,
      suggestedValue: limits.cabinet.maxWidth,
    });
  }
  if (cabinet.dimensions.height < limits.cabinet.minHeight) {
    errors.push({
      ruleId: 'cabinet-min-height',
      ruleName: 'Altura Mínima',
      message: `Altura (${cabinet.dimensions.height}mm) é menor que o mínimo (${limits.cabinet.minHeight}mm)`,
      field: 'height',
      currentValue: cabinet.dimensions.height,
      suggestedValue: limits.cabinet.minHeight,
    });
  }
  if (cabinet.dimensions.height > limits.cabinet.maxHeight) {
    errors.push({
      ruleId: 'cabinet-max-height',
      ruleName: 'Altura Máxima',
      message: `Altura (${cabinet.dimensions.height}mm) excede o máximo (${limits.cabinet.maxHeight}mm)`,
      field: 'height',
      currentValue: cabinet.dimensions.height,
      suggestedValue: limits.cabinet.maxHeight,
    });
  }
  if (cabinet.dimensions.depth < limits.cabinet.minDepth) {
    errors.push({
      ruleId: 'cabinet-min-depth',
      ruleName: 'Profundidade Mínima',
      message: `Profundidade (${cabinet.dimensions.depth}mm) é menor que o mínimo (${limits.cabinet.minDepth}mm)`,
      field: 'depth',
      currentValue: cabinet.dimensions.depth,
      suggestedValue: limits.cabinet.minDepth,
    });
  }
  if (cabinet.dimensions.depth > limits.cabinet.maxDepth) {
    warnings.push({
      ruleId: 'cabinet-max-depth',
      ruleName: 'Profundidade Máxima',
      message: `Profundidade (${cabinet.dimensions.depth}mm) excede o típico (${limits.cabinet.maxDepth}mm)`,
      field: 'depth',
      currentValue: cabinet.dimensions.depth,
    });
  }

  // Drawer width check
  if (pattern) {
    const hasDrawers = pattern.zones.some(z => z.type === 'drawer');
    if (hasDrawers && cabinet.dimensions.width > limits.drawer.maxWidth) {
      warnings.push({
        ruleId: 'drawer-max-width',
        ruleName: 'Largura Gaveta',
        message: `Gavetas mais largas que ${limits.drawer.maxWidth}mm podem precisar de corrediças reforçadas`,
        field: 'width',
        currentValue: cabinet.dimensions.width,
      });
    }
  }

  // Shelf span warning
  if (cabinet.dimensions.width > limits.shelf.maxSpanWithoutSupport) {
    warnings.push({
      ruleId: 'shelf-span',
      ruleName: 'Vão Prateleira',
      message: `Prateleiras com mais de ${limits.shelf.maxSpanWithoutSupport}mm podem precisar de suporte central`,
      field: 'width',
      currentValue: cabinet.dimensions.width,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
  };
}

// ============================================
// Store Interface
// ============================================

interface CabinetStore {
  // Global Settings
  globalSettings: GlobalSettings;
  setGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  resetGlobalSettings: () => void;

  // Rule Sets
  ruleSets: RuleSet[];
  addRuleSet: (ruleSet: RuleSet) => void;
  updateRuleSet: (id: string, updates: Partial<RuleSet>) => void;
  deleteRuleSet: (id: string) => void;
  getRuleSetById: (id: string) => RuleSet | undefined;

  // Materials Library
  materials: Material[];
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  getMaterialById: (id: string) => Material | undefined;

  // Hardware Library
  hardware: HardwareItem[];
  addHardware: (item: HardwareItem) => void;
  updateHardware: (id: string, updates: Partial<HardwareItem>) => void;
  deleteHardware: (id: string) => void;
  getHardwareById: (id: string) => HardwareItem | undefined;

  // Pattern Library
  patterns: CabinetPattern[];
  addPattern: (pattern: CabinetPattern) => void;
  updatePattern: (id: string, updates: Partial<CabinetPattern>) => void;
  deletePattern: (id: string) => void;
  getPatternById: (id: string) => CabinetPattern | undefined;

  // Current Project
  currentProject: Project | null;
  createProject: (name: string, description?: string, client?: string) => void;
  updateProject: (updates: Partial<Project>) => void;
  clearProject: () => void;

  // Countertops
  addCountertop: (countertop: Countertop) => void;
  updateCountertop: (id: string, updates: Partial<Countertop>) => void;
  deleteCountertop: (id: string) => void;

  // Cabinet Instances
  addCabinet: (cabinet: Omit<CabinetInstance, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCabinet: (id: string, updates: Partial<CabinetInstance>) => void;
  deleteCabinet: (id: string) => void;
  duplicateCabinet: (id: string) => string | null;
  getCabinetById: (id: string) => CabinetInstance | undefined;

  // Inserted Elements
  addInsertedElement: (cabinetId: string, element: InsertedElement) => void;
  updateInsertedElement: (cabinetId: string, elementId: string, updates: Partial<InsertedElement>) => void;
  deleteInsertedElement: (cabinetId: string, elementId: string) => void;

  // Validation
  validateCabinet: (id: string) => ValidationResult | null;
  validateProject: () => ValidationResult;

  // UI State
  ui: UIState;
  setSelectedCabinet: (id: string | null) => void;
  toggleDarkMode: () => void;
  setActiveTab: (tab: UIState['activeTab']) => void;
  setIsExporting: (isExporting: boolean) => void;
  toggle3DPreview: (isOpen?: boolean) => void;
  set3DPreviewOptions: (options: Partial<NonNullable<UIState['preview3D']>>) => void;
  openCutListModal: (ruleSetId?: string) => void;
  closeCutListModal: () => void;
}

// ============================================
// Utility Functions
// ============================================

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const now = (): string => new Date().toISOString();

// ============================================
// Zustand Store with Persistence
// ============================================

export const useCabinetStore = create<CabinetStore>()(
  persist(
    (set, get) => ({
      // ========== Global Settings ==========
      globalSettings: defaultGlobalSettings,
      
      setGlobalSettings: (settings) =>
        set((state) => ({
          globalSettings: { ...state.globalSettings, ...settings },
        })),
      
      resetGlobalSettings: () =>
        set({ globalSettings: defaultGlobalSettings }),

      // ========== Rule Sets ==========
      ruleSets: [defaultRuleSet],

      addRuleSet: (ruleSet) =>
        set((state) => ({
          ruleSets: [...state.ruleSets, ruleSet],
        })),

      updateRuleSet: (id, updates) =>
        set((state) => ({
          ruleSets: state.ruleSets.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      deleteRuleSet: (id) =>
        set((state) => ({
          ruleSets: state.ruleSets.filter((r) => r.id !== id),
        })),

      getRuleSetById: (id) => get().ruleSets.find((r) => r.id === id),

      // ========== Materials Library ==========
      materials: defaultMaterials,

      addMaterial: (material) =>
        set((state) => ({
          materials: [...state.materials, material],
        })),

      updateMaterial: (id, updates) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: now() } : m
          ),
        })),

      deleteMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
        })),

      getMaterialById: (id) => get().materials.find((m) => m.id === id),

      // ========== Hardware Library ==========
      hardware: defaultHardware,

      addHardware: (item) =>
        set((state) => ({
          hardware: [...state.hardware, item],
        })),

      updateHardware: (id, updates) =>
        set((state) => ({
          hardware: state.hardware.map((h) =>
            h.id === id ? { ...h, ...updates, updatedAt: now() } : h
          ),
        })),

      deleteHardware: (id) =>
        set((state) => ({
          hardware: state.hardware.filter((h) => h.id !== id),
        })),

      getHardwareById: (id) => get().hardware.find((h) => h.id === id),

      // ========== Pattern Library ==========
      patterns: defaultPatterns,
      
      addPattern: (pattern) =>
        set((state) => ({
          patterns: [...state.patterns, pattern],
        })),
      
      updatePattern: (id, updates) =>
        set((state) => ({
          patterns: state.patterns.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now() } : p
          ),
        })),
      
      deletePattern: (id) =>
        set((state) => ({
          patterns: state.patterns.filter((p) => p.id !== id),
        })),
      
      getPatternById: (id) => get().patterns.find((p) => p.id === id),

      // ========== Current Project ==========
      currentProject: null,
      
      createProject: (name, description, client) =>
        set({
          currentProject: {
            id: generateId(),
            name,
            description,
            client,
            cabinets: [],
            createdAt: now(),
            updatedAt: now(),
          },
        }),
      
      updateProject: (updates) =>
        set((state) => ({
          currentProject: state.currentProject
            ? { ...state.currentProject, ...updates, updatedAt: now() }
            : null,
        })),
      
      clearProject: () =>
        set({ currentProject: null, ui: { ...get().ui, selectedCabinetId: null } }),

      // ========== Cabinet Instances ==========
      addCabinet: (cabinetData) => {
        const id = generateId();
        const newCabinet: CabinetInstance = {
          ...cabinetData,
          id,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                cabinets: [...state.currentProject.cabinets, newCabinet],
                updatedAt: now(),
              }
            : null,
          ui: { ...state.ui, selectedCabinetId: id },
        }));
        
        return id;
      },
      
      updateCabinet: (id, updates) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                cabinets: state.currentProject.cabinets.map((c) =>
                  c.id === id ? { ...c, ...updates, updatedAt: now() } : c
                ),
                updatedAt: now(),
              }
            : null,
        })),
      
      deleteCabinet: (id) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                cabinets: state.currentProject.cabinets.filter((c) => c.id !== id),
                updatedAt: now(),
              }
            : null,
          ui: {
            ...state.ui,
            selectedCabinetId:
              state.ui.selectedCabinetId === id ? null : state.ui.selectedCabinetId,
          },
        })),
      
      duplicateCabinet: (id) => {
        const cabinet = get().getCabinetById(id);
        if (!cabinet) return null;
        
        const newId = generateId();
        const duplicated: CabinetInstance = {
          ...cabinet,
          id: newId,
          name: `${cabinet.name} (Copy)`,
          createdAt: now(),
          updatedAt: now(),
        };
        
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                cabinets: [...state.currentProject.cabinets, duplicated],
                updatedAt: now(),
              }
            : null,
          ui: { ...state.ui, selectedCabinetId: newId },
        }));
        
        return newId;
      },
      
      getCabinetById: (id) =>
        get().currentProject?.cabinets.find((c) => c.id === id),

      // ========== Countertops ==========
      addCountertop: (countertop) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                countertops: [...(state.currentProject.countertops || []), countertop],
                updatedAt: now(),
              }
            : null,
        })),

      updateCountertop: (id, updates) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                countertops: (state.currentProject.countertops || []).map((c) =>
                  c.id === id ? { ...c, ...updates } : c
                ),
                updatedAt: now(),
              }
            : null,
        })),

      deleteCountertop: (id) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                countertops: (state.currentProject.countertops || []).filter((c) => c.id !== id),
                updatedAt: now(),
              }
            : null,
        })),

      // ========== Inserted Elements ==========
      addInsertedElement: (cabinetId, element) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                cabinets: state.currentProject.cabinets.map((c) =>
                  c.id === cabinetId
                    ? {
                        ...c,
                        insertedElements: [...(c.insertedElements || []), element],
                        updatedAt: now(),
                      }
                    : c
                ),
                updatedAt: now(),
              }
            : null,
        })),

      updateInsertedElement: (cabinetId, elementId, updates) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                cabinets: state.currentProject.cabinets.map((c) =>
                  c.id === cabinetId
                    ? {
                        ...c,
                        insertedElements: (c.insertedElements || []).map((e) =>
                          e.id === elementId ? { ...e, ...updates } : e
                        ),
                        updatedAt: now(),
                      }
                    : c
                ),
                updatedAt: now(),
              }
            : null,
        })),

      deleteInsertedElement: (cabinetId, elementId) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                cabinets: state.currentProject.cabinets.map((c) =>
                  c.id === cabinetId
                    ? {
                        ...c,
                        insertedElements: (c.insertedElements || []).filter((e) => e.id !== elementId),
                        updatedAt: now(),
                      }
                    : c
                ),
                updatedAt: now(),
              }
            : null,
        })),

      // ========== Validation ==========
      validateCabinet: (id) => {
        const cabinet = get().getCabinetById(id);
        if (!cabinet) return null;
        const pattern = get().getPatternById(cabinet.patternId);
        return validateCabinet(cabinet, pattern);
      },

      validateProject: () => {
        const project = get().currentProject;
        const allErrors: ValidationMessage[] = [];
        const allWarnings: ValidationMessage[] = [];
        const allInfo: ValidationMessage[] = [];

        if (project) {
          for (const cabinet of project.cabinets) {
            const pattern = get().getPatternById(cabinet.patternId);
            const result = validateCabinet(cabinet, pattern);
            allErrors.push(...result.errors.map((e) => ({ ...e, ruleName: `${cabinet.name}: ${e.ruleName}` })));
            allWarnings.push(...result.warnings.map((w) => ({ ...w, ruleName: `${cabinet.name}: ${w.ruleName}` })));
            allInfo.push(...result.info.map((i) => ({ ...i, ruleName: `${cabinet.name}: ${i.ruleName}` })));
          }
        }

        return {
          isValid: allErrors.length === 0,
          errors: allErrors,
          warnings: allWarnings,
          info: allInfo,
        };
      },

      // ========== UI State ==========
      ui: defaultUIState,
      
      setSelectedCabinet: (id) =>
        set((state) => ({
          ui: { ...state.ui, selectedCabinetId: id },
        })),
      
      toggleDarkMode: () =>
        set((state) => ({
          ui: { ...state.ui, isDarkMode: !state.ui.isDarkMode },
        })),
      
      setActiveTab: (tab) =>
        set((state) => ({
          ui: { ...state.ui, activeTab: tab },
        })),
      
      setIsExporting: (isExporting) =>
        set((state) => ({
          ui: { ...state.ui, isExporting },
        })),

      toggle3DPreview: (isOpen) =>
        set((state) => ({
          ui: {
            ...state.ui,
            preview3D: {
              ...state.ui.preview3D,
              isOpen: isOpen ?? !state.ui.preview3D?.isOpen,
            },
          },
        })),

      set3DPreviewOptions: (options) =>
        set((state) => ({
          ui: {
            ...state.ui,
            preview3D: {
              ...state.ui.preview3D,
              ...options,
            },
          },
        })),

      openCutListModal: (ruleSetId) =>
        set((state) => ({
          ui: {
            ...state.ui,
            cutListModal: {
              isOpen: true,
              selectedRuleSetId: ruleSetId ?? state.ruleSets[0]?.id,
            },
          },
        })),

      closeCutListModal: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            cutListModal: {
              isOpen: false,
              selectedRuleSetId: undefined,
            },
          },
        })),
    }),
    {
      name: 'ligna-cabinet-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        globalSettings: state.globalSettings,
        ruleSets: state.ruleSets,
        materials: state.materials,
        hardware: state.hardware,
        patterns: state.patterns,
        currentProject: state.currentProject,
        ui: {
          isDarkMode: state.ui.isDarkMode,
          sidebarWidth: state.ui.sidebarWidth,
          propertiesPanelWidth: state.ui.propertiesPanelWidth,
        },
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CabinetStore>;
        return {
          ...currentState,
          ...persisted,
          // Deep merge UI state to preserve new fields like cutListModal
          ui: {
            ...currentState.ui,
            ...(persisted.ui || {}),
          },
        };
      },
    }
  )
);

// ============================================
// Selector Hooks for Performance
// ============================================

export const useGlobalSettings = () => useCabinetStore((state) => state.globalSettings);
export const useMaterials = () => useCabinetStore((state) => state.materials);
export const useHardware = () => useCabinetStore((state) => state.hardware);
export const usePatterns = () => useCabinetStore((state) => state.patterns);
export const useCurrentProject = () => useCabinetStore((state) => state.currentProject);
export const useUIState = () => useCabinetStore((state) => state.ui);

export const useSelectedCabinet = () => {
  const selectedId = useCabinetStore((state) => state.ui.selectedCabinetId);
  const cabinets = useCabinetStore((state) => state.currentProject?.cabinets ?? []);
  return cabinets.find((c) => c.id === selectedId) ?? null;
};

export const useMaterialById = (id: string | undefined) => {
  const materials = useCabinetStore((state) => state.materials);
  return id ? materials.find((m) => m.id === id) : undefined;
};

export const useHardwareById = (id: string | undefined) => {
  const hardware = useCabinetStore((state) => state.hardware);
  return id ? hardware.find((h) => h.id === id) : undefined;
};
