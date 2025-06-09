// Design System Configuration
export const designSystem = {
  colors: {
    brand: {
      primary: "#FF6B35", // Exctel Orange
      secondary: "#2D3748", // Dark Gray
      accent: "#4299E1", // Blue
    },
    neutral: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    semantic: {
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
  },

  typography: {
    fontSizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
    },
    fontWeights: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeights: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  spacing: {
    xs: "0.5rem",
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },

  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },

  transitions: {
    fast: "150ms ease-in-out",
    normal: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },
};

// Component variants
export const componentVariants = {
  button: {
    primary: "bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md",
    secondary:
      "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300",
    ghost: "bg-transparent hover:bg-neutral-100 text-neutral-700",
    destructive: "bg-semantic-error hover:bg-semantic-error/90 text-white",
  },

  card: {
    default: "bg-white rounded-xl shadow-md border border-neutral-200",
    elevated: "bg-white rounded-xl shadow-lg border border-neutral-200",
    interactive:
      "bg-white rounded-xl shadow-md border border-neutral-200 hover:shadow-lg transition-shadow",
  },

  input: {
    default:
      "border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent",
    error:
      "border border-semantic-error rounded-lg px-3 py-2 focus:ring-2 focus:ring-semantic-error focus:border-transparent",
  },
};
