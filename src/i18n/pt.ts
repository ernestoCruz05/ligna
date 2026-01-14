// ============================================
// Portuguese Translations for Ligna
// ============================================

export const pt = {
  // Common
  app: {
    name: 'Ligna',
    tagline: 'Gerador Paramétrico de Armários',
  },

  // Actions
  actions: {
    add: 'Adicionar',
    edit: 'Editar',
    delete: 'Eliminar',
    duplicate: 'Duplicar',
    save: 'Guardar',
    cancel: 'Cancelar',
    create: 'Criar',
    export: 'Exportar',
    import: 'Importar',
    reset: 'Repor',
    close: 'Fechar',
    confirm: 'Confirmar',
  },

  // Navigation/Tabs
  nav: {
    project: 'Projeto',
    library: 'Biblioteca',
    settings: 'Definições',
    patterns: 'Modelos',
    rules: 'Regras',
  },

  // Header
  header: {
    newProject: 'Novo Projeto',
    export: 'Exportar',
    exportFullCutList: 'Exportar Lista de Corte Completa',
    exportFullCutListDesc: 'Todas as peças com etiquetas',
    exportConsolidated: 'Exportar Consolidado',
    exportConsolidatedDesc: 'Peças idênticas combinadas',
    switchToLight: 'Mudar para modo claro',
    switchToDark: 'Mudar para modo escuro',
  },

  // Projects
  project: {
    title: 'Projeto',
    name: 'Nome do Projeto',
    client: 'Nome do Cliente',
    clientPlaceholder: 'Opcional',
    noProject: 'Sem Projeto',
    newProject: 'Novo Projeto',
    createProject: 'Criar Projeto',
    renameProject: 'Renomear Projeto',
    enterNewName: 'Introduza o novo nome:',
    namePlaceholder: 'ex: Renovação da Cozinha',
  },

  // Cabinets
  cabinet: {
    title: 'Armário',
    titlePlural: 'Armários',
    addCabinet: 'Adicionar Armário',
    noCabinets: 'Ainda não há armários',
    noCabinetsHint: 'Clique em "Adicionar Armário" para começar',
    selectPattern: 'Selecionar Modelo de Armário',
    unknownPattern: 'Modelo Desconhecido',
    cabinetName: 'Nome do Armário',
    confirmDelete: 'Tem a certeza que pretende eliminar este armário?',
  },

  // Pattern/Templates
  pattern: {
    title: 'Modelo',
    titlePlural: 'Modelos',
    patternLibrary: 'Biblioteca de Modelos',
    patternsAvailable: 'modelos disponíveis',
    createPattern: 'Criar Modelo',
    editPattern: 'Editar Modelo',
    newPattern: 'Novo Modelo',
    patternName: 'Nome do Modelo',
    patternDescription: 'Descrição',
    category: 'Categoria',
    zones: 'zonas',
    partRules: 'regras de peças',
    addZone: 'Adicionar Zona',
    defaultDimensions: 'Dimensões Padrão',
    blankCabinet: 'Armário em Branco',
  },

  // Pattern categories
  categories: {
    base: 'Base',
    wall: 'Parede',
    tall: 'Alto',
    'drawer-unit': 'Gaveteiro',
    custom: 'Personalizado',
  },

  // Zone types
  zoneTypes: {
    drawer: 'Gaveta',
    door: 'Porta',
    shelf: 'Prateleira',
    opening: 'Abertura',
    'fixed-shelf': 'Prateleira Fixa',
    'appliance-space': 'Espaço para Electrodoméstico',
    divider: 'Divisória Vertical',
  },

  // Properties Panel
  properties: {
    title: 'Propriedades',
    selectCabinet: 'Selecione um armário para editar as propriedades',
    dimensions: 'Dimensões (mm)',
    height: 'Altura',
    width: 'Largura',
    depth: 'Profundidade',
    location: 'Localização / Divisão',
    locationPlaceholder: 'ex: Cozinha, Quarto',
    notes: 'Notas',
    notesPlaceholder: 'Adicione notas sobre este armário...',
  },

  // Cut List
  cutList: {
    title: 'Lista de Corte',
    preview: 'Pré-visualização da Lista de Corte',
    part: 'Peça',
    length: 'C',
    width: 'L',
    quantity: 'Qtd',
    totalParts: 'peças no total',
    noParts: 'Adicione primeiro alguns armários.',
    generate: 'Gerar Lista de Corte',
    selectRules: 'Selecionar Regras',
    selectRulesDesc: 'Escolha o conjunto de regras a aplicar',
    generating: 'A gerar...',
    modal: {
      title: 'Gerar Lista de Corte',
      selectRuleSet: 'Selecionar Conjunto de Regras',
      noRuleSets: 'Nenhum conjunto de regras disponível',
      createRuleSet: 'Criar um conjunto de regras primeiro',
      includeOptions: 'Opções de Inclusão',
      includeEdgeBanding: 'Incluir Orlagem',
      includeHardware: 'Incluir Ferragens',
      includeCosts: 'Incluir Custos',
      groupByMaterial: 'Agrupar por Material',
      generateBtn: 'Gerar Lista',
      cancelBtn: 'Cancelar',
    },
  },

  // Rules
  rules: {
    title: 'Regras de Construção',
    description: 'Configure como os armários são construídos',
    ruleSet: 'Conjunto de Regras',
    ruleSets: 'Conjuntos de Regras',
    newRuleSet: 'Novo Conjunto',
    editRuleSet: 'Editar Conjunto',
    deleteRuleSet: 'Eliminar Conjunto',
    defaultRuleSet: 'Conjunto Padrão',
    ruleSetName: 'Nome',
    ruleSetDescription: 'Descrição',
    construction: {
      title: 'Método de Construção',
      sideConstruction: 'Ligação das Ilhargas',
      sidesOnBottom: 'Ilhargas sobre o Fundo',
      bottomBetweenSides: 'Fundo entre Ilhargas',
      allBetween: 'Tudo entre Ilhargas',
      backPanelMethod: 'Método do Painel Traseiro',
      overlay: 'Sobreposto',
      insetGroove: 'Inserido em Ranhura',
      insetRebate: 'Inserido em Rebaixo',
      drawerConstruction: 'Construção de Gavetas',
      drawerSidesOnBottom: 'Ilhargas sobre Fundo',
      bottomInGroove: 'Fundo em Ranhura',
    },
    materials: {
      title: 'Materiais Padrão',
      carcass: 'Carcaça',
      front: 'Frentes',
      back: 'Traseira',
      drawer: 'Gavetas',
      shelf: 'Prateleiras',
    },
    offsets: {
      title: 'Folgas e Ajustes',
      drawerFrontGap: 'Folga Frente de Gaveta',
      doorGap: 'Folga de Portas',
      shelfInset: 'Recuo da Prateleira',
      drawerSlideOffset: 'Offset Corrediças',
      backPanelThickness: 'Espessura Traseira',
      backGrooveDepth: 'Profundidade Ranhura',
    },
    edgeBanding: {
      title: 'Orlagem',
      carcassEdges: 'Bordas da Carcaça',
      shelfEdges: 'Bordas das Prateleiras',
      doorEdges: 'Bordas das Portas',
      drawerFrontEdges: 'Bordas Frentes Gaveta',
      front: 'Frente',
      back: 'Traseira',
      top: 'Topo',
      bottom: 'Fundo',
      left: 'Esquerda',
      right: 'Direita',
      all: 'Todas',
      frontOnly: 'Só Frente',
    },
  },

  // Settings
  settings: {
    title: 'Definições',
    globalSettings: 'Definições Globais',
    materialThickness: 'Espessura do Material (mm)',
    backPanelThickness: 'Espessura do Painel Traseiro (mm)',
    backPanelGrooveDepth: 'Profundidade da Ranhura (mm)',
    edgeBandingThickness: 'Espessura da Orla (mm)',
    resetToDefaults: 'Repor Valores Padrão',
  },

  // Pattern Editor
  patternEditor: {
    title: 'Editor de Modelos',
    newPattern: 'Novo Modelo',
    editPattern: 'Editar Modelo',
    startBlank: 'Começar com Caixa em Branco',
    addDrawer: 'Adicionar Gaveta',
    addShelf: 'Adicionar Prateleira',
    addDoor: 'Adicionar Porta',
    addOpening: 'Adicionar Abertura',
    removeZone: 'Remover Zona',
    zoneHeight: 'Altura da Zona',
    zoneName: 'Nome da Zona',
    savePattern: 'Guardar Modelo',
    discardChanges: 'Descartar Alterações',
    dragToResize: 'Arraste para redimensionar',
    previewMode: 'Pré-visualização',
    editMode: 'Modo de Edição',
  },

  // Messages
  messages: {
    confirmDeleteCabinet: 'Tem a certeza que pretende eliminar este armário?',
    confirmDeletePattern: 'Tem a certeza que pretende eliminar este modelo?',
    noPartsToExport: 'Não há peças para exportar. Adicione primeiro alguns armários.',
    patternSaved: 'Modelo guardado com sucesso!',
    patternDeleted: 'Modelo eliminado.',
  },

  // Validation
  validation: {
    required: 'Campo obrigatório',
    minValue: 'O valor mínimo é',
    maxValue: 'O valor máximo é',
  },

  // Charta Integration
  charta: {
    title: 'Exportar para Charta',
    notConfigured: 'Charta não configurado',
    configure: 'Configurar',
    configureCharta: 'Configurar Charta',
    serverUrl: 'URL do Servidor',
    serverUrlPlaceholder: 'ex: https://charta.example.com',
    apiKey: 'Chave de API (opcional)',
    apiKeyPlaceholder: 'Deixe vazio se não for necessário',
    testConnection: 'Testar Conexão',
    testing: 'A testar...',
    connectionSuccess: 'Conexão estabelecida!',
    connectionFailed: 'Falha na conexão',
    save: 'Guardar',
    cancel: 'Cancelar',
    disconnect: 'Desligar',
    selectProject: 'Selecionar Obra (opcional)',
    selectProjectPlaceholder: 'Enviar para Inbox',
    noProjects: 'Sem projetos ativos',
    exporting: 'A enviar...',
    exportSuccess: 'Enviado para Charta com sucesso!',
    exportFailed: 'Falha ao enviar para Charta',
    exportCutList: 'Enviar para Charta',
    viewInCharta: 'Ver no Charta',
  },
} as const;

export type Translations = typeof pt;
export default pt;
