import React from 'react';
import { colorSwatch, colorSwatchContainer, colorInfo, colorSwatchBox } from './ColorPalette.css';
import { useTheme } from '@/ui/styles/ThemeContext';

interface ColorPaletteProps {
  /** Color palette name */
  palette: 'primary' | 'secondary' | 'tertiary' | 'neutral';
}

// Theme-specific color palettes
const colorPalettes = {
  light: {
    primary: {
      '50': '#f0f9ff',
      '100': '#e0f2fe', 
      '200': '#bae6fd',
      '300': '#7dd3fc',
      '400': '#38bdf8',
      '500': '#0ea5e9',  // Sky blue like Castle in the Sky
      '600': '#0284c7',
      '700': '#0369a1',
      '800': '#075985',
      '900': '#0c4a6e',
    },
    secondary: {
      '50': '#fefce8',
      '100': '#fef9c3',
      '200': '#fef08a', 
      '300': '#fde047',
      '400': '#facc15',
      '500': '#eab308',  // Warm golden yellow like Totoro's belly
      '600': '#ca8a04',
      '700': '#a16207',
      '800': '#854d0e',
      '900': '#713f12',
    },
    tertiary: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',  // Forest green like Totoro and nature
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
    },
    neutral: {
      '50': '#faf5f0',
      '100': '#f5ebe0',
      '200': '#e7d2c1',
      '300': '#d1b5a1',
      '400': '#b89882',
      '500': '#a08066',  // Warm earth tones like Ghibli backgrounds
      '600': '#8b6f56',
      '700': '#725c47',
      '800': '#5a4938',
      '900': '#45382c',
    },
  },
  dark: {
    primary: {
      '50': '#0f1927',
      '100': '#1a2332',
      '200': '#243547',
      '300': '#384a61',
      '400': '#4f677f',
      '500': '#7dd3fc',  // Soft moonlight blue
      '600': '#93e2ff',
      '700': '#a9eaff',
      '800': '#bef0ff',
      '900': '#d4f6ff',
    },
    secondary: {
      '50': '#1c1a0f',
      '100': '#2e2a1a',
      '200': '#453f24',
      '300': '#615938',
      '400': '#82784f',
      '500': '#fde047',  // Warm firefly yellow
      '600': '#fde68a',
      '700': '#fed7aa',
      '800': '#fef3c7',
      '900': '#fffbeb',
    },
    tertiary: {
      '50': '#0f1c14',
      '100': '#1a2e20',
      '200': '#24452f',
      '300': '#386147',
      '400': '#4f8261',
      '500': '#4ade80',  // Forest green
      '600': '#6ee99a',
      '700': '#86efac',
      '800': '#a3f3bf',
      '900': '#c3f9d2',
    },
    neutral: {
      '50': '#0f1419',
      '100': '#1a1f2e',
      '200': '#252b3f',
      '300': '#364051',
      '400': '#475566',
      '500': '#64748b',  // Cool dark grays
      '600': '#94a3b8',
      '700': '#cbd5e1',
      '800': '#e2e8f0',
      '900': '#f1f5f9',
    },
  },
  cyberpunk: {
    primary: {
      '50': '#001a33',
      '100': '#002647',
      '200': '#003d70',
      '300': '#005299',
      '400': '#0080cc',
      '500': '#00d4ff',  // Bright neon cyan
      '600': '#1ae0ff',
      '700': '#4deaff',
      '800': '#80f4ff',
      '900': '#b3fdff',
    },
    secondary: {
      '50': '#33001a',
      '100': '#470026',
      '200': '#70003d',
      '300': '#990052',
      '400': '#cc0080',
      '500': '#ff0099',  // Vibrant neon pink
      '600': '#ff1aad',
      '700': '#ff4dc2',
      '800': '#ff80d6',
      '900': '#ffb3eb',
    },
    tertiary: {
      '50': '#001a0d',
      '100': '#002613',
      '200': '#003d1f',
      '300': '#00522b',
      '400': '#008037',
      '500': '#00ff88',  // Electric neon green
      '600': '#1aff99',
      '700': '#4dffaa',
      '800': '#80ffbb',
      '900': '#b3ffcc',
    },
    neutral: {
      '50': '#0a0a0f',
      '100': '#141419',
      '200': '#1f1f28',
      '300': '#333347',
      '400': '#4d4d66',
      '500': '#666685',  // Purple-tinted grays
      '600': '#8080a3',
      '700': '#9999c2',
      '800': '#b3b3e0',
      '900': '#ccccff',
    },
  },
  japanese90s: {
    primary: {
      '50': '#fff5f5',
      '100': '#ffe6e6',
      '200': '#ffcccc',
      '300': '#ffb3b3',
      '400': '#ff9999',  // Soft coral pink
      '500': '#ff8080',
      '600': '#ff6666',
      '700': '#ff4d4d',
      '800': '#ff3333',
      '900': '#ff1a1a',
    },
    secondary: {
      '50': '#fffcf0',
      '100': '#fff7d9',
      '200': '#ffefb3',
      '300': '#ffe680',
      '400': '#ffdd4d',
      '500': '#ffd966',  // Warm golden yellow
      '600': '#ffcc4d',
      '700': '#ffbf33',
      '800': '#ffb31a',
      '900': '#ffa600',
    },
    tertiary: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#99d6a3',  // Soft mint green
      '600': '#80cc8f',
      '700': '#66c27a',
      '800': '#4db866',
      '900': '#33ae52',
    },
    neutral: {
      '50': '#faf6f2',
      '100': '#f0ebe6',
      '200': '#e6d4c7',
      '300': '#d9c7b8',
      '400': '#ccb8a3',
      '500': '#bfa68f',  // Warm paper tones
      '600': '#a3927a',
      '700': '#8a7a65',
      '800': '#726250',
      '900': '#5a4a42',
    },
  },
  disney: {
    primary: {
      '50': '#eff8ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#4a90e2',  // Royal blue
      '600': '#357abd',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
    },
    secondary: {
      '50': '#fffbeb',
      '100': '#fef3c7',
      '200': '#fde68a',
      '300': '#fcd34d',
      '400': '#fbbf24',
      '500': '#f5a623',  // Warm gold
      '600': '#e8941c',
      '700': '#d97706',
      '800': '#b45309',
      '900': '#92400e',
    },
    tertiary: {
      '50': '#faf5ff',
      '100': '#f3e8ff',
      '200': '#e9d5ff',
      '300': '#d8b4fe',
      '400': '#c084fc',
      '500': '#9b59b6',  // Enchanted purple
      '600': '#8e44ad',
      '700': '#7c3aed',
      '800': '#6b21a8',
      '900': '#581c87',
    },
    neutral: {
      '50': '#fefefe',
      '100': '#f8f6ff',
      '200': '#e7e5e4',
      '300': '#d5dbdb',
      '400': '#bdc3c7',
      '500': '#95a5a6',  // Soft silver
      '600': '#7f8c8d',
      '700': '#5a6c7d',
      '800': '#34495e',
      '900': '#2c3e50',
    },
  },
  neobrutal: {
    primary: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#3b82f6',
      '500': '#0066ff',  // Bold electric blue
      '600': '#0052cc',
      '700': '#004499',
      '800': '#003366',
      '900': '#002233',
    },
    secondary: {
      '50': '#fff7ed',
      '100': '#ffedd5',
      '200': '#fed7aa',
      '300': '#fdba74',
      '400': '#fb923c',
      '500': '#ff6600',  // Warning orange
      '600': '#e55a00',
      '700': '#cc4f00',
      '800': '#b34400',
      '900': '#993300',
    },
    tertiary: {
      '50': '#fef2f2',
      '100': '#fee2e2',
      '200': '#fecaca',
      '300': '#fca5a5',
      '400': '#f87171',
      '500': '#ff0033',  // Aggressive red
      '600': '#e60029',
      '700': '#cc0024',
      '800': '#b3001f',
      '900': '#99001a',
    },
    neutral: {
      '50': '#ffffff',
      '100': '#f5f5f5',
      '200': '#e5e5e5',
      '300': '#d4d4d4',
      '400': '#a3a3a3',
      '500': '#737373',  // Industrial grays
      '600': '#525252',
      '700': '#404040',
      '800': '#262626',
      '900': '#000000',
    },
  },
  kdrama: {
    primary: {
      '50': '#fce4ec',
      '100': '#f8bbd9',
      '200': '#f48fb1',  // Soft rose pink
      '300': '#f06292',
      '400': '#ec407a',
      '500': '#e91e63',
      '600': '#d81b60',
      '700': '#c2185b',
      '800': '#ad1457',
      '900': '#880e4f',
    },
    secondary: {
      '50': '#fff3e0',
      '100': '#ffe0b2',
      '200': '#ffccbc',
      '300': '#ffab91',  // Warm peach
      '400': '#ff8a65',
      '500': '#ff7043',
      '600': '#ff5722',
      '700': '#f4511e',
      '800': '#e64a19',
      '900': '#d84315',
    },
    tertiary: {
      '50': '#f3e5f5',
      '100': '#e1bee7',
      '200': '#ce93d8',  // Soft lavender
      '300': '#ba68c8',
      '400': '#ab47bc',
      '500': '#9c27b0',
      '600': '#8e24aa',
      '700': '#7b1fa2',
      '800': '#6a1b9a',
      '900': '#4a148c',
    },
    neutral: {
      '50': '#fefefe',
      '100': '#faf8ff',
      '200': '#f5f5f5',
      '300': '#e0e0e0',
      '400': '#bdbdbd',
      '500': '#9e9e9e',  // Soft grays
      '600': '#757575',
      '700': '#616161',
      '800': '#424242',
      '900': '#212121',
    },
  },
  almosthermes: {
    primary: {
      '50': '#fef2f2',
      '100': '#fde2e2',
      '200': '#fbc7c7',
      '300': '#f5a3a3',
      '400': '#ed7979',
      '500': '#8b1538',  // Rich burgundy
      '600': '#a0174a',
      '700': '#701229',
      '800': '#5f0f22',
      '900': '#4e0c1c',
    },
    secondary: {
      '50': '#fef7ed',
      '100': '#fdedd5',
      '200': '#fbd8aa',
      '300': '#f8c074',
      '400': '#f5a43c',
      '500': '#d2691e',  // Warm cognac
      '600': '#daa520',
      '700': '#b8860b',
      '800': '#9a6f08',
      '900': '#7f5a06',
    },
    tertiary: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#2d5016',  // Deep forest green
      '600': '#365f1d',
      '700': '#1e3a0f',
      '800': '#15260a',
      '900': '#0d1806',
    },
    neutral: {
      '50': '#fffef9',
      '100': '#faf8f3',
      '200': '#f5f5dc',
      '300': '#d4af37',
      '400': '#b8860b',
      '500': '#8b7355',  // Luxury tones
      '600': '#6b5b47',
      '700': '#4a4a4a',
      '800': '#2a2a2a',
      '900': '#1a1a1a',
    },
  },
  'slate-monochrome': {
    primary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#475569',  // Cool slate blue-gray
      '600': '#334155',
      '700': '#1e293b',
      '800': '#0f172a',
      '900': '#020617',
    },
    secondary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',  // Medium gray with slight warmth
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a',
    },
    tertiary: {
      '50': '#ffffff',
      '100': '#f8fafc',
      '200': '#f1f5f9',
      '300': '#e2e8f0',
      '400': '#cbd5e1',
      '500': '#94a3b8',  // Light slate for accents
      '600': '#64748b',
      '700': '#475569',
      '800': '#334155',
      '900': '#1e293b',
    },
    neutral: {
      '50': '#ffffff',
      '100': '#f8fafc',
      '200': '#f1f5f9',
      '300': '#e2e8f0',
      '400': '#cbd5e1',
      '500': '#94a3b8',  // Professional grays
      '600': '#64748b',
      '700': '#475569',
      '800': '#334155',
      '900': '#0f172a',
    },
  },
} as const;

export const ColorPalette: React.FC<ColorPaletteProps> = ({ palette }) => {
  const { currentTheme } = useTheme();
  
  // Get the color values for the current theme and palette
  const colors = colorPalettes[currentTheme][palette];
  
  return (
    <div>
      <h4 style={{ marginBottom: '8px', textTransform: 'capitalize' }}>
        {palette}
      </h4>
      <div className={colorSwatchContainer}>
        {Object.entries(colors).map(([shade, color]) => {
          return (
            <div key={shade} className={colorSwatch}>
              <div 
                className={colorSwatchBox}
                style={{
                  backgroundColor: color,
                }}
                title={`${palette}-${shade}: ${color}`}
              />
              <div className={colorInfo}>
                <div style={{ fontSize: '12px', fontWeight: 'medium' }}>{shade}</div>
                <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'monospace' }}>
                  {color}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};