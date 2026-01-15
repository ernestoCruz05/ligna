import type { JointType } from '../types';

const now = new Date().toISOString();

/**
 * Default joint types for cabinet construction.
 * These represent common woodworking joints used in cabinet making.
 * 
 * Dimensional impact rules:
 * - extendsInsertedPiece: When true, the inserted piece (e.g., shelf) extends
 *   into the joint by the joint's depth. This is typical for dado joints where
 *   the shelf sits IN the groove.
 * - tolerance: Subtracted from the extended dimension to allow for assembly fit
 *   and wood movement. Typically 0.5-1mm.
 */
export const defaultJoints: JointType[] = [
  // ============================================
  // BUTT JOINTS (No dimensional impact)
  // ============================================
  {
    id: 'butt-simple',
    name: 'Junta de Topo',
    description: 'Junta simples onde as peças se encontram topo a topo. Sem impacto dimensional.',
    category: 'butt',
    depth: 0,
    extendsInsertedPiece: false,
    tolerance: 0,
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // DADO JOINTS (Groove joints)
  // ============================================
  {
    id: 'dado-6mm',
    name: 'Dado 6mm',
    description: 'Ranhura de 6mm de profundidade. Típico para prateleiras em MDF 18mm (1/3 da espessura).',
    category: 'dado',
    depth: 6,
    width: 18, // Typically matches inserted piece thickness
    extendsInsertedPiece: true,
    tolerance: 0.5,
    requiredMaterialThickness: 18,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'dado-8mm',
    name: 'Dado 8mm',
    description: 'Ranhura de 8mm de profundidade. Para encaixes mais profundos em materiais mais espessos.',
    category: 'dado',
    depth: 8,
    extendsInsertedPiece: true,
    tolerance: 0.5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'dado-9mm',
    name: 'Dado 9mm',
    description: 'Ranhura de 9mm de profundidade (1/2 de 18mm). Encaixe mais robusto.',
    category: 'dado',
    depth: 9,
    width: 18,
    extendsInsertedPiece: true,
    tolerance: 0.5,
    requiredMaterialThickness: 18,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'dado-shallow',
    name: 'Dado Raso 3mm',
    description: 'Ranhura rasa de 3mm. Para posicionamento/alinhamento sem comprometer estrutura.',
    category: 'dado',
    depth: 3,
    extendsInsertedPiece: true,
    tolerance: 0.5,
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // RABBET JOINTS (L-shaped edge cuts)
  // ============================================
  {
    id: 'rabbet-back-3mm',
    name: 'Rebaixo Traseira 3mm',
    description: 'Rebaixo para traseira de 3mm (HDF). Profundidade = espessura da traseira.',
    category: 'rabbet',
    depth: 3,
    width: 10, // Typically 10mm wide rabbet
    extendsInsertedPiece: true, // Back panel extends into rabbet
    tolerance: 0.5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'rabbet-back-6mm',
    name: 'Rebaixo Traseira 6mm',
    description: 'Rebaixo para traseira de 6mm (MDF fino ou contraplacado).',
    category: 'rabbet',
    depth: 6,
    width: 10,
    extendsInsertedPiece: true,
    tolerance: 0.5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'rabbet-standard',
    name: 'Rebaixo Padrão',
    description: 'Rebaixo genérico de meia espessura. Bom para cantos de caixas.',
    category: 'rabbet',
    depth: 9, // Half of 18mm
    width: 18,
    extendsInsertedPiece: true,
    tolerance: 0.5,
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // TONGUE AND GROOVE
  // ============================================
  {
    id: 'tongue-groove-6mm',
    name: 'Macho-Fêmea 6mm',
    description: 'Encaixe macho-fêmea com 6mm de profundidade. Para painéis longos.',
    category: 'tongue-groove',
    depth: 6,
    width: 6,
    extendsInsertedPiece: true,
    tolerance: 0.3,
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // HARDWARE-BASED JOINTS (No cut dimension impact)
  // ============================================
  {
    id: 'dowel',
    name: 'Cavilha',
    description: 'Junta com cavilhas. Dimensões de corte não são afetadas (furação pós-corte).',
    category: 'dowel',
    depth: 0,
    extendsInsertedPiece: false,
    tolerance: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'cam-lock',
    name: 'Minifix/Cam Lock',
    description: 'Ferragem de conexão rápida. Dimensões de corte não são afetadas.',
    category: 'cam-lock',
    depth: 0,
    extendsInsertedPiece: false,
    tolerance: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'pocket-screw',
    name: 'Parafuso Oblíquo',
    description: 'Parafuso em ângulo (pocket hole). Sem impacto nas dimensões de corte.',
    category: 'pocket-screw',
    depth: 0,
    extendsInsertedPiece: false,
    tolerance: 0,
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // MITER JOINTS
  // ============================================
  {
    id: 'miter-45',
    name: 'Meia-Esquadria 45°',
    description: 'Corte a 45° para cantos. A dimensão externa permanece, mas o corte é angular.',
    category: 'miter',
    depth: 0,
    extendsInsertedPiece: false,
    tolerance: 0,
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * Get a joint type by ID
 */
export function getJointById(id: string): JointType | undefined {
  return defaultJoints.find((j) => j.id === id);
}

/**
 * Get all joints by category
 */
export function getJointsByCategory(category: JointType['category']): JointType[] {
  return defaultJoints.filter((j) => j.category === category);
}
