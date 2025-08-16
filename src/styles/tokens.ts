/**
 * Design Tokens - Centralized design system values
 * These tokens are used throughout the application for consistency
 */

// Color palette for programmatic use
export const colors = {
  primary: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    400: "#F87171",
    500: "#E50914",
    600: "#DC2626",
    700: "#B91C1C",
    900: "#7F1D1D",
    DEFAULT: "#E50914",
  },

  dark: {
    bg: {
      primary: "#0A0A0A",
      secondary: "#141414",
      tertiary: "#1F1F1F",
      elevated: "#2A2A2A",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B3B3B3",
      tertiary: "#737373",
      quaternary: "#525252",
    },
    border: {
      primary: "rgba(255, 255, 255, 0.1)",
      secondary: "rgba(255, 255, 255, 0.05)",
    },
  },

  accent: {
    cyan: "#00D4FF",
    purple: "#8B5CF6",
    green: "#10B981",
    yellow: "#F59E0B",
    pink: "#EC4899",
  },

  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
} as const;

// Typography scale
export const typography = {
  fontFamily: {
    sans: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "sans-serif",
    ],
    mono: ["Fira Code", "Monaco", "Consolas", "monospace"],
  },

  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },

  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

// Spacing scale (4px grid system)
export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

// Border radius scale
export const borderRadius = {
  none: "0",
  sm: "0.125rem",
  base: "0.25rem",
  md: "0.375rem",
  lg: "0.5rem",
  xl: "1rem",
  "2xl": "1.5rem",
  "3xl": "2rem",
  full: "9999px",
} as const;

// Shadow scale
export const boxShadow = {
  sm: "0 2px 4px 0 rgba(0, 0, 0, 0.3)",
  base: "0 4px 12px 0 rgba(0, 0, 0, 0.4)",
  md: "0 4px 12px 0 rgba(0, 0, 0, 0.4)",
  lg: "0 8px 24px 0 rgba(0, 0, 0, 0.5)",
  xl: "0 16px 48px 0 rgba(0, 0, 0, 0.6)",
  "2xl": "0 24px 64px 0 rgba(0, 0, 0, 0.7)",
  primary: "0 8px 24px 0 rgba(229, 9, 20, 0.3)",
  none: "none",
} as const;

// Animation durations
export const duration = {
  75: "75ms",
  100: "100ms",
  150: "150ms",
  200: "200ms",
  300: "300ms",
  500: "500ms",
  700: "700ms",
  1000: "1000ms",
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Z-index scale for layering
export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Component sizes
export const sizes = {
  button: {
    sm: { px: spacing[3], py: spacing[1], text: typography.fontSize.xs },
    md: { px: spacing[4], py: spacing[2], text: typography.fontSize.sm },
    lg: { px: spacing[6], py: spacing[3], text: typography.fontSize.base },
  },
  input: {
    sm: { px: spacing[3], py: spacing[1], text: typography.fontSize.sm },
    md: { px: spacing[3], py: spacing[2], text: typography.fontSize.sm },
    lg: { px: spacing[4], py: spacing[3], text: typography.fontSize.base },
  },
} as const;
