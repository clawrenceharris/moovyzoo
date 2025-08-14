import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary palette (Netflix Red)
        primary: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          400: '#F87171',
          500: '#E50914',
          600: '#DC2626',
          700: '#B91C1C',
          900: '#7F1D1D',
          DEFAULT: '#E50914',
        },

        // Dark theme foundation (default)
        dark: {
          bg: {
            primary: '#0A0A0A', // Main app background
            secondary: '#141414', // Card backgrounds (Netflix gray)
            tertiary: '#1F1F1F', // Elevated surfaces
            elevated: '#2A2A2A', // Highest elevation
            glass: 'rgba(20, 20, 20, 0.8)', // Glassmorphism
          },
          surface: {
            1: '#161616',
            2: '#1E1E1E',
            3: '#262626',
            4: '#2E2E2E',
          },
          text: {
            primary: '#FFFFFF', // Main headings, important text
            secondary: '#B3B3B3', // Body text, descriptions
            tertiary: '#737373', // Subtle text, placeholders
            quaternary: '#525252', // Disabled text
          },
          border: {
            primary: 'rgba(255, 255, 255, 0.1)',
            secondary: 'rgba(255, 255, 255, 0.05)',
            accent: 'rgba(229, 9, 20, 0.2)',
          },
        },

        // Accent colors (Snapchat-inspired)
        accent: {
          cyan: {
            DEFAULT: '#00D4FF',
            dark: '#0EA5E9',
            50: '#F0F9FF',
          },
          purple: {
            DEFAULT: '#8B5CF6',
            dark: '#7C3AED',
            50: '#FAF5FF',
          },
          green: {
            DEFAULT: '#10B981',
            dark: '#059669',
            50: '#ECFDF5',
          },
          yellow: {
            DEFAULT: '#F59E0B',
            dark: '#D97706',
            50: '#FFFBEB',
          },
          pink: {
            DEFAULT: '#EC4899',
            dark: '#DB2777',
            50: '#FDF2F8',
          },
        },

        // Light theme (for future flexibility)
        light: {
          bg: {
            primary: '#FFFFFF',
            secondary: '#F8F9FA',
            tertiary: '#F1F3F4',
          },
          text: {
            primary: '#1A1A1A',
            secondary: '#4A4A4A',
            tertiary: '#6B7280',
          },
        },

        // Semantic colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },

      borderRadius: {
        xl: '1rem', // 16px - default for most components
        '2xl': '1.5rem', // 24px - large containers
        '3xl': '2rem', // 32px - extra large containers
      },

      spacing: {
        '0.5': '0.125rem', // 2px
        '18': '4.5rem', // 72px
        '88': '22rem', // 352px
        '128': '32rem', // 512px
      },

      fontSize: {
        // Display sizes (Hero sections)
        'display-xl': ['5rem', { lineHeight: '1.0', fontWeight: '800' }],
        'display-lg': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],

        // Headings
        h1: ['2rem', { lineHeight: '1.25', fontWeight: '700' }],
        h2: ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.33', fontWeight: '600' }],
        h4: ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        h5: ['1.125rem', { lineHeight: '1.44', fontWeight: '500' }],

        // Body text
        'body-xl': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['1.125rem', { lineHeight: '1.56', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.43', fontWeight: '400' }],
        'body-xs': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],

        // Labels & UI
        'label-lg': ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        'label-md': ['0.875rem', { lineHeight: '1.43', fontWeight: '500' }],
        'label-sm': ['0.75rem', { lineHeight: '1.33', fontWeight: '500' }],
        'label-xs': ['0.625rem', { lineHeight: '1.2', fontWeight: '500' }],
      },

      boxShadow: {
        // Dark theme shadows (stronger for contrast)
        sm: '0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 12px 0 rgba(0, 0, 0, 0.4)',
        lg: '0 8px 24px 0 rgba(0, 0, 0, 0.5)',
        xl: '0 16px 48px 0 rgba(0, 0, 0, 0.6)',
        '2xl': '0 24px 64px 0 rgba(0, 0, 0, 0.7)',

        // Colored shadows for accents
        primary: '0 8px 24px 0 rgba(229, 9, 20, 0.3)',
        cyan: '0 8px 24px 0 rgba(0, 212, 255, 0.2)',
        purple: '0 8px 24px 0 rgba(139, 92, 246, 0.2)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
      },

      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-up-fade': 'slideUpFade 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUpFade: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(229, 9, 20, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(229, 9, 20, 0)' },
        },
      },

      transitionTimingFunction: {
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },

      transitionDuration: {
        '100': '100ms',
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Keep class-based for flexibility
}

export default config
