/**
 * Gradient image generation utility
 */

export interface GradientOptions {
  width?: number;
  height?: number;
  colors?: string[];
  direction?: 'to-r' | 'to-br' | 'to-b' | 'to-bl' | 'to-l' | 'to-tl' | 'to-t' | 'to-tr';
  seed?: string;
}

// Beautiful color palettes
const COLOR_PALETTES = [
  // Blue series
  ['#667eea', '#764ba2'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  
  // Purple series
  ['#fa709a', '#fee140'],
  ['#a8edea', '#fed6e3'],
  ['#d299c2', '#fef9d7'],
  
  // Orange series
  ['#fd746c', '#ff9068'],
  ['#ffa726', '#fb8c00'],
  ['#ffb347', '#ffcc02'],
  
  // Green series
  ['#56ab2f', '#a8e6cf'],
  ['#11998e', '#38ef7d'],
  ['#00b4db', '#0083b0'],
  
  // Red series
  ['#ff6b6b', '#feca57'],
  ['#ff7675', '#fd79a8'],
  ['#e17055', '#f39c12'],
  
  // Deep tones
  ['#2c3e50', '#4ca1af'],
  ['#232526', '#414345'],
  ['#1e3c72', '#2a5298'],
];

const DIRECTIONS = [
  'to-r', 'to-br', 'to-b', 'to-bl', 'to-l', 'to-tl', 'to-t', 'to-tr'
] as const;

/**
 * Generate hash value from string
 */
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate random gradient options based on seed
 */
export function generateGradientOptions(seed: string, customOptions: GradientOptions = {}): Required<GradientOptions> {
  const hash = hashString(seed);
  
  const colorIndex = hash % COLOR_PALETTES.length;
  const directionIndex = hash % DIRECTIONS.length;
  
  return {
    width: customOptions.width ?? 300,
    height: customOptions.height ?? 400,
    colors: customOptions.colors ?? COLOR_PALETTES[colorIndex],
    direction: customOptions.direction ?? DIRECTIONS[directionIndex],
    seed: customOptions.seed ?? seed
  };
}

/**
 * Generate SVG gradient image
 */
export function generateSVGGradient(options: GradientOptions): string {
  const finalOptions = generateGradientOptions(options.seed || 'default', options);
  const { width, height, colors, direction } = finalOptions;
  
  // Convert direction to SVG coordinates
  const gradientCoords = {
    'to-r': { x1: '0%', y1: '0%', x2: '100%', y2: '0%' },
    'to-l': { x1: '100%', y1: '0%', x2: '0%', y2: '0%' },
    'to-b': { x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
    'to-t': { x1: '0%', y1: '100%', x2: '0%', y2: '0%' },
    'to-br': { x1: '0%', y1: '0%', x2: '100%', y2: '100%' },
    'to-bl': { x1: '100%', y1: '0%', x2: '0%', y2: '100%' },
    'to-tr': { x1: '0%', y1: '100%', x2: '100%', y2: '0%' },
    'to-tl': { x1: '100%', y1: '100%', x2: '0%', y2: '0%' },
  };
  
  const coords = gradientCoords[direction];
  const stopColors = colors.map((color, index) => 
    `<stop offset="${(index / (colors.length - 1)) * 100}%" style="stop-color:${color};stop-opacity:1" />`
  ).join('');
  
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}">
          ${stopColors}
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
    </svg>
  `.trim();
}

/**
 * Generate SVG gradient as Data URL
 */
export function generateGradientDataURL(options: GradientOptions): string {
  const svg = generateSVGGradient(options);
  const encoded = encodeURIComponent(svg);
  return `data:image/svg+xml,${encoded}`;
}

/**
 * Generate CSS gradient string for background
 */
export function generateCSSGradient(options: GradientOptions): string {
  const finalOptions = generateGradientOptions(options.seed || 'default', options);
  const { colors, direction } = finalOptions;
  
  const cssDirection = {
    'to-r': 'to right',
    'to-l': 'to left',
    'to-b': 'to bottom',
    'to-t': 'to top',
    'to-br': 'to bottom right',
    'to-bl': 'to bottom left',
    'to-tr': 'to top right',
    'to-tl': 'to top left',
  };
  
  const colorStops = colors.join(', ');
  return `linear-gradient(${cssDirection[direction]}, ${colorStops})`;
}

/**
 * Generate unique seed from book title and author
 */
export function generateBookSeed(title: string, author?: string): string {
  return `${title}-${author || 'unknown'}`;
}