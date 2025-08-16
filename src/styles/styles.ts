import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Design System Style Patterns
export const styles = {
  button: {
    base: "btn",
    variants: {
      primary: "btn-primary",
      secondary: "btn-secondary",
      outline:
        "btn border-2 border-primary text-primary hover:bg-primary hover:text-white",
      ghost: "btn text-primary hover:bg-primary/10",
    },
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm", // default
      lg: "px-6 py-3 text-base",
    },
  },
  card: {
    base: "card",
    interactive: "card-interactive",
    header: "card-header",
  },

  // Form components
  form: {
    input: "form-input",
    inputError: "form-input-error",
    label: "form-label",
    error: "form-error",
    help: "form-help",
    group: "form-group",
  },

  // Typography (using Tailwind's custom font sizes)
  text: {
    displayLg: "text-display-lg text-dark-text-primary",
    displayMd: "text-display-md text-dark-text-primary",
    displaySm: "text-display-sm text-dark-text-primary",
    h1: "text-h1 text-dark-text-primary",
    h2: "text-h2 text-dark-text-primary",
    h3: "text-h3 text-dark-text-primary",
    h4: "text-h4 text-dark-text-primary",
    bodyLg: "text-body-lg text-dark-text-primary",
    bodyMd: "text-body-md text-dark-text-primary",
    bodySm: "text-body-sm text-dark-text-primary",
    labelLg: "text-label-lg text-dark-text-primary",
    labelMd: "text-label-md text-dark-text-primary",
    labelSm: "text-label-sm text-dark-text-primary",
    secondary: "text-dark-text-secondary",
    tertiary: "text-dark-text-tertiary",
    accent: "text-primary",
    error: "text-red-400",
  },

  // Layout containers
  layout: {
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    containerSm: "max-w-2xl mx-auto px-4 sm:px-6",
    containerMd: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
    section: "py-12 sm:py-16 lg:py-20",
    sectionSm: "py-8 sm:py-12",
    grid: "grid gap-6",
    gridSm: "grid gap-4",
    gridLg: "grid gap-8",
    flex: "flex items-center justify-between",
    flexCol: "flex flex-col space-y-4",
    flexCenter: "flex items-center justify-center",
  },
  status: {
    error: "text-red-400",
    success: "text-green-400",
  },
  // Loading states
  loading: {
    spinner: "spinner h-6 w-6",
    spinnerSm: "spinner h-4 w-4",
    spinnerLg: "spinner h-8 w-8",
    skeleton: "skeleton",
    skeletonText: "skeleton h-4 w-full",
    skeletonTitle: "skeleton h-6 w-3/4",
    skeletonAvatar: "skeleton h-12 w-12 rounded-full",
  },

  // Interactive states
  interactive: {
    hover: "transition-all duration-200 hover:scale-105",
    press: "transition-all duration-100 active:scale-95",
    focus: "focus-ring",
    disabled: "opacity-50 cursor-not-allowed",
  },

  // Spacing utilities (following 4px grid)
  spacing: {
    xs: "space-y-2",
    sm: "space-y-4",
    md: "space-y-6",
    lg: "space-y-8",
    xl: "space-y-12",
  },

  // Animation utilities
  animation: {
    fadeIn: "animate-fade-in",
    slideUp: "animate-slide-up",
    scaleIn: "animate-scale-in",
  },

  // Responsive utilities
  responsive: {
    hide: {
      mobile: "hidden sm:block",
      tablet: "hidden lg:block",
      desktop: "lg:hidden",
    },
    show: {
      mobile: "block sm:hidden",
      tablet: "hidden sm:block lg:hidden",
      desktop: "hidden lg:block",
    },
  },
} as const;

// Style builder functions for component variants
export const button = (
  variant: "primary" | "secondary" | "outline" | "ghost" | "accent" = "primary",
  size: "sm" | "md" | "lg" = "md"
) => {
  const baseClass = "btn";
  const variantClass = `btn-${variant}`;
  const sizeClass = size !== "md" ? `btn-${size}` : "";

  return cn(baseClass, variantClass, sizeClass);
};

export const card = (
  variant: "base" | "interactive" | "flat" | "elevated" = "base"
) => {
  if (variant === "base") return "card";
  return `card-${variant}`;
};

export const badge = (
  variant:
    | "primary"
    | "secondary"
    | "accent"
    | "success"
    | "warning"
    | "error" = "primary"
) => {
  return `badge-${variant}`;
};

export const status = (variant: "success" | "warning" | "error" | "info") => {
  return `status-${variant}`;
};

// Utility functions for common patterns (backward compatibility)
export const getButtonClasses = button;
export const getCardClasses = card;
export const getTextClasses = (
  variant: keyof typeof styles.text = "bodyMd"
) => {
  return styles.text[variant];
};

// Color palette for programmatic use
export const colors = {
  primary: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#E50914",
    600: "#DC2626",
    700: "#B91C1C",
  },
  secondary: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    500: "#221F1F",
    600: "#1A1818",
    700: "#111111",
  },
  accent: {
    50: "#F0FDFA",
    500: "#00FFEC",
    600: "#00D4C7",
  },
  semantic: {
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
  },
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    inverse: "#FFFFFF",
    accent: "#E50914",
  },
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
