import type { HardwareItem } from '../types';

// ============================================
// Default Hardware Library
// ============================================

const now = new Date().toISOString();

export const defaultHardware: HardwareItem[] = [
  // ============================================
  // HINGES
  // ============================================
  {
    id: 'hinge-soft-close-110',
    name: 'Dobradiça Fecho Suave 110°',
    type: 'hinge',
    brand: 'Generic',
    specifications: {
      openingAngle: 110,
      color: 'Níquel',
    },
    costPerUnit: 2.50,
    requiresPerUnit: 2, // 2 per door (small doors)
    notes: 'Para portas até 600mm',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'hinge-blum-clip-110',
    name: 'Blum CLIP top 110°',
    type: 'hinge',
    brand: 'Blum',
    model: 'CLIP top',
    specifications: {
      openingAngle: 110,
      loadCapacity: 25,
      color: 'Níquel',
    },
    costPerUnit: 4.80,
    requiresPerUnit: 2,
    notes: 'Dobradiça premium com sistema de clip',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'hinge-blum-clip-155',
    name: 'Blum CLIP top 155°',
    type: 'hinge',
    brand: 'Blum',
    model: 'CLIP top 155°',
    specifications: {
      openingAngle: 155,
      loadCapacity: 25,
      color: 'Níquel',
    },
    costPerUnit: 8.50,
    requiresPerUnit: 2,
    notes: 'Abertura ampla para armários de canto',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'hinge-push-open',
    name: 'Dobradiça Push Open',
    type: 'hinge',
    brand: 'Generic',
    specifications: {
      openingAngle: 110,
      color: 'Níquel',
    },
    costPerUnit: 5.50,
    requiresPerUnit: 2,
    notes: 'Para portas sem puxador',
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // DRAWER SLIDES
  // ============================================
  {
    id: 'slide-roller-400',
    name: 'Corrediça de Rolos 400mm',
    type: 'drawer-slide',
    brand: 'Generic',
    specifications: {
      length: 400,
      loadCapacity: 25,
    },
    costPerUnit: 3.50,
    requiresPerUnit: 1, // Pair
    notes: 'Corrediça básica',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'slide-roller-500',
    name: 'Corrediça de Rolos 500mm',
    type: 'drawer-slide',
    brand: 'Generic',
    specifications: {
      length: 500,
      loadCapacity: 25,
    },
    costPerUnit: 4.00,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'slide-soft-close-400',
    name: 'Corrediça Fecho Suave 400mm',
    type: 'drawer-slide',
    brand: 'Generic',
    specifications: {
      length: 400,
      loadCapacity: 30,
    },
    costPerUnit: 8.50,
    requiresPerUnit: 1,
    notes: 'Extração total com fecho suave',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'slide-soft-close-500',
    name: 'Corrediça Fecho Suave 500mm',
    type: 'drawer-slide',
    brand: 'Generic',
    specifications: {
      length: 500,
      loadCapacity: 30,
    },
    costPerUnit: 9.50,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'slide-blum-tandem-500',
    name: 'Blum TANDEM 500mm',
    type: 'drawer-slide',
    brand: 'Blum',
    model: 'TANDEM plus BLUMOTION',
    specifications: {
      length: 500,
      loadCapacity: 30,
    },
    costPerUnit: 28.00,
    requiresPerUnit: 1,
    notes: 'Sistema oculto premium',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'slide-blum-tandem-450',
    name: 'Blum TANDEM 450mm',
    type: 'drawer-slide',
    brand: 'Blum',
    model: 'TANDEM plus BLUMOTION',
    specifications: {
      length: 450,
      loadCapacity: 30,
    },
    costPerUnit: 26.00,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'slide-blum-movento-500',
    name: 'Blum MOVENTO 500mm',
    type: 'drawer-slide',
    brand: 'Blum',
    model: 'MOVENTO',
    specifications: {
      length: 500,
      loadCapacity: 60,
    },
    costPerUnit: 45.00,
    requiresPerUnit: 1,
    notes: 'Alta capacidade de carga',
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // HANDLES
  // ============================================
  {
    id: 'handle-bar-128',
    name: 'Puxador Barra 128mm',
    type: 'handle',
    brand: 'Generic',
    specifications: {
      length: 128,
      finish: 'Inox escovado',
    },
    costPerUnit: 3.50,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'handle-bar-256',
    name: 'Puxador Barra 256mm',
    type: 'handle',
    brand: 'Generic',
    specifications: {
      length: 256,
      finish: 'Inox escovado',
    },
    costPerUnit: 5.50,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'handle-bar-320',
    name: 'Puxador Barra 320mm',
    type: 'handle',
    brand: 'Generic',
    specifications: {
      length: 320,
      finish: 'Inox escovado',
    },
    costPerUnit: 7.00,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'handle-knob-round',
    name: 'Puxador Botão Redondo',
    type: 'handle',
    brand: 'Generic',
    specifications: {
      finish: 'Níquel acetinado',
    },
    costPerUnit: 2.00,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'handle-profile-black',
    name: 'Perfil Puxador Preto',
    type: 'handle',
    brand: 'Generic',
    specifications: {
      finish: 'Alumínio preto',
    },
    costPerUnit: 12.00, // per meter
    requiresPerUnit: 1,
    notes: 'Preço por metro linear',
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // SHELF SUPPORTS
  // ============================================
  {
    id: 'shelf-pin-5mm',
    name: 'Suporte Prateleira 5mm',
    type: 'shelf-pin',
    brand: 'Generic',
    specifications: {
      color: 'Níquel',
    },
    costPerUnit: 0.15,
    requiresPerUnit: 4, // 4 per shelf
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'shelf-pin-glass',
    name: 'Suporte Prateleira Vidro',
    type: 'shelf-pin',
    brand: 'Generic',
    specifications: {
      color: 'Transparente',
    },
    costPerUnit: 0.50,
    requiresPerUnit: 4,
    notes: 'Com almofada de silicone',
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // CONNECTORS & FASTENERS
  // ============================================
  {
    id: 'cam-lock-15mm',
    name: 'Minifix 15mm',
    type: 'cam-lock',
    brand: 'Generic',
    costPerUnit: 0.80,
    requiresPerUnit: 1,
    notes: 'Inclui came e parafuso',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'dowel-8x35',
    name: 'Cavilha 8x35mm',
    type: 'dowel',
    brand: 'Generic',
    specifications: {
      length: 35,
    },
    costPerUnit: 0.05,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'confirmat-5x50',
    name: 'Parafuso Confirmat 5x50mm',
    type: 'screw',
    brand: 'Generic',
    specifications: {
      length: 50,
    },
    costPerUnit: 0.08,
    requiresPerUnit: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'connector-bolt',
    name: 'Parafuso Ligação M6x60',
    type: 'connector',
    brand: 'Generic',
    costPerUnit: 0.45,
    requiresPerUnit: 1,
    notes: 'Para ligação entre módulos',
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // LEGS & FEET
  // ============================================
  {
    id: 'leg-plastic-100',
    name: 'Pé Plástico Regulável 100mm',
    type: 'leg',
    brand: 'Generic',
    specifications: {
      length: 100,
      loadCapacity: 150,
      color: 'Preto',
    },
    costPerUnit: 1.20,
    requiresPerUnit: 4, // 4 per cabinet
    notes: 'Ajuste 90-110mm',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'leg-plastic-150',
    name: 'Pé Plástico Regulável 150mm',
    type: 'leg',
    brand: 'Generic',
    specifications: {
      length: 150,
      loadCapacity: 150,
      color: 'Preto',
    },
    costPerUnit: 1.50,
    requiresPerUnit: 4,
    notes: 'Ajuste 130-170mm',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'leg-metal-round',
    name: 'Pé Metal Redondo 150mm',
    type: 'leg',
    brand: 'Generic',
    specifications: {
      length: 150,
      loadCapacity: 200,
      finish: 'Cromado',
    },
    costPerUnit: 5.00,
    requiresPerUnit: 4,
    createdAt: now,
    updatedAt: now,
  },

  // ============================================
  // SOFT CLOSE ACCESSORIES
  // ============================================
  {
    id: 'soft-close-add-on',
    name: 'Amortecedor Add-on',
    type: 'soft-close',
    brand: 'Generic',
    costPerUnit: 1.80,
    requiresPerUnit: 1,
    notes: 'Para adicionar fecho suave a dobradiças standard',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'push-latch',
    name: 'Trinco Push Open',
    type: 'push-open',
    brand: 'Generic',
    costPerUnit: 2.50,
    requiresPerUnit: 1,
    notes: 'Para portas sem puxador',
    createdAt: now,
    updatedAt: now,
  },
];

export default defaultHardware;
