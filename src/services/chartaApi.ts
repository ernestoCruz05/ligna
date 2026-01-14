// ============================================
// Charta API Client - Export documents to Charta
// ============================================

/**
 * Response from Charta upload API
 */
export interface ChartaUploadResponse {
  id: string;
  file_path: string;
  file_type: string;
  original_name: string;
  file_url: string;
}

/**
 * Project (Obra) from Charta
 */
export interface ChartaProject {
  id: string;
  name: string;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at: string;
}

/**
 * Charta API configuration
 */
export interface ChartaConfig {
  baseUrl: string;
  apiKey?: string;
}

const STORAGE_KEY = 'ligna-charta-config';

/**
 * Get stored Charta configuration
 */
export function getChartaConfig(): ChartaConfig | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save Charta configuration
 */
export function saveChartaConfig(config: ChartaConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Clear Charta configuration
 */
export function clearChartaConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if Charta is configured
 */
export function isChartaConfigured(): boolean {
  const config = getChartaConfig();
  return config !== null && config.baseUrl.length > 0;
}

/**
 * Build headers for Charta API requests
 */
function buildHeaders(config: ChartaConfig): HeadersInit {
  const headers: HeadersInit = {};
  if (config.apiKey) {
    headers['X-API-Key'] = config.apiKey;
  }
  return headers;
}

/**
 * Test connection to Charta server
 */
export async function testChartaConnection(config: ChartaConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(`${config.baseUrl}/api/projects?status=active`, {
      method: 'GET',
      headers: buildHeaders(config),
    });
    
    if (response.ok) {
      return { ok: true, message: 'Conexão estabelecida com sucesso!' };
    } else if (response.status === 401) {
      return { ok: false, message: 'Chave de API inválida' };
    } else {
      return { ok: false, message: `Erro: ${response.status} ${response.statusText}` };
    }
  } catch (error) {
    return { ok: false, message: `Falha na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}` };
  }
}

/**
 * Fetch active projects from Charta
 */
export async function fetchChartaProjects(): Promise<ChartaProject[]> {
  const config = getChartaConfig();
  if (!config) {
    throw new Error('Charta não configurado');
  }
  
  const response = await fetch(`${config.baseUrl}/api/projects?status=active`, {
    method: 'GET',
    headers: buildHeaders(config),
  });
  
  if (!response.ok) {
    throw new Error(`Falha ao buscar projetos: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Upload a file to Charta
 * @param file - File blob to upload
 * @param filename - Filename for the upload
 * @param projectId - Optional project ID to assign the document to
 */
export async function uploadToCharta(
  file: Blob,
  filename: string,
  projectId?: string
): Promise<ChartaUploadResponse> {
  const config = getChartaConfig();
  if (!config) {
    throw new Error('Charta não configurado');
  }
  
  const formData = new FormData();
  formData.append('file', file, filename);
  
  // Upload the file
  const uploadResponse = await fetch(`${config.baseUrl}/api/upload`, {
    method: 'POST',
    headers: buildHeaders(config),
    body: formData,
  });
  
  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Falha no upload: ${error}`);
  }
  
  const uploadResult: ChartaUploadResponse = await uploadResponse.json();
  
  // If a project ID is provided, assign the document to that project
  if (projectId) {
    const assignResponse = await fetch(`${config.baseUrl}/api/documents/${uploadResult.id}/assign`, {
      method: 'PATCH',
      headers: {
        ...buildHeaders(config),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ project_id: projectId }),
    });
    
    if (!assignResponse.ok) {
      console.warn('Documento enviado mas não foi atribuído ao projeto');
    }
  }
  
  return uploadResult;
}

/**
 * Generate a PDF from cut list data
 * Uses browser's print functionality to generate PDF
 */
export function generateCutListPDF(
  projectName: string,
  parts: Array<{ partName: string; length: number; width: number; quantity: number }>,
  ruleSetName: string
): Blob {
  // Create HTML content for the PDF
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Lista de Corte - ${projectName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { font-size: 18px; margin-bottom: 5px; }
        h2 { font-size: 14px; color: #666; margin-top: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; font-size: 12px; }
        td { font-size: 11px; }
        .right { text-align: right; }
        .mono { font-family: monospace; }
        .footer { margin-top: 20px; font-size: 10px; color: #999; }
        .total { font-weight: bold; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>Lista de Corte</h1>
      <h2>${projectName} • ${ruleSetName}</h2>
      <table>
        <thead>
          <tr>
            <th>Peça</th>
            <th class="right">Comprimento (mm)</th>
            <th class="right">Largura (mm)</th>
            <th class="right">Qtd</th>
          </tr>
        </thead>
        <tbody>
          ${parts.map(p => `
            <tr>
              <td>${p.partName}</td>
              <td class="right mono">${p.length.toFixed(1)}</td>
              <td class="right mono">${p.width.toFixed(1)}</td>
              <td class="right mono">${p.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p class="total">Total: ${parts.reduce((sum, p) => sum + p.quantity, 0)} peças</p>
      <p class="footer">Gerado por Ligna em ${new Date().toLocaleString('pt-PT')}</p>
    </body>
    </html>
  `;
  
  return new Blob([html], { type: 'text/html' });
}

/**
 * Generate CSV from cut list data
 */
export function generateCutListCSV(
  parts: Array<{ partName: string; length: number; width: number; quantity: number }>
): Blob {
  const headers = ['Peça', 'Comprimento (mm)', 'Largura (mm)', 'Quantidade'];
  const rows = parts.map(p => [
    p.partName,
    p.length.toFixed(1),
    p.width.toFixed(1),
    p.quantity.toString()
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Capture an SVG element as a PNG blob
 * @param svgElement - The SVG DOM element to capture
 * @param scale - Scale factor for higher resolution (default 2x)
 */
export async function svgToPng(svgElement: SVGSVGElement, scale: number = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
      
      // Get dimensions
      const bbox = svgElement.getBoundingClientRect();
      const width = bbox.width * scale;
      const height = bbox.height * scale;
      
      // Set explicit dimensions on the cloned SVG
      clonedSvg.setAttribute('width', String(width));
      clonedSvg.setAttribute('height', String(height));
      
      // Apply a white background for the export
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('width', '100%');
      bgRect.setAttribute('height', '100%');
      bgRect.setAttribute('fill', 'white');
      clonedSvg.insertBefore(bgRect, clonedSvg.firstChild);
      
      // Serialize the SVG
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Create an image from the SVG
      const img = new Image();
      img.onload = () => {
        // Create a canvas and draw the image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw the SVG
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to PNG blob
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(svgUrl);
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png', 0.95);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG as image'));
      };
      
      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Get the SVG element from the cabinet visualizer
 * Searches for the SVG inside the visualizer container
 */
export function getCabinetVisualizerSvg(): SVGSVGElement | null {
  // The CabinetVisualizer renders an SVG with a specific class
  const svg = document.querySelector('.cabinet-visualizer-svg') as SVGSVGElement | null;
  if (svg) {
    return svg;
  }
  // Fallback: find the container and get its SVG
  const container = document.querySelector('.cabinet-visualizer-container');
  if (container) {
    return container.querySelector('svg');
  }
  return null;
}
