/**
 * SportsVilla Centralised Design Tokens
 * Typed constants for Admin (--sv-*) and Play (--play-*) design systems,
 * with raw hex values for canvas, QR code generation, and chart contexts.
 */

export const adminTokens = {
  colors: {
    bg: "var(--sv-bg)",
    bgSubtle: "var(--sv-bg-subtle)",
    bgSurface: "var(--sv-bg-surface)",
    surface: "var(--sv-surface)",
    surfaceRaised: "var(--sv-surface-raised)",
    surfaceHover: "var(--sv-surface-hover)",
    surfaceActive: "var(--sv-surface-active)",
    border: "var(--sv-border)",
    borderSubtle: "var(--sv-border-subtle)",
    borderFocus: "var(--sv-border-focus)",
    borderStrong: "var(--sv-border-strong)",
    text: {
      primary: "var(--sv-text-primary)",
      secondary: "var(--sv-text-secondary)",
      muted: "var(--sv-text-muted)",
      disabled: "var(--sv-text-disabled)",
      inverse: "var(--sv-text-inverse)",
    },
    brand: {
      DEFAULT: "var(--sv-brand)",
      hover: "var(--sv-brand-hover)",
      subtle: "var(--sv-brand-subtle)",
      foreground: "var(--sv-brand-foreground)",
    },
    status: {
      success: {
        DEFAULT: "var(--sv-status-success)",
        subtle: "var(--sv-success-subtle)",
        border: "var(--sv-success-border)",
        text: "var(--sv-success-text)",
      },
      warning: {
        DEFAULT: "var(--sv-status-warning)",
        subtle: "var(--sv-warning-subtle)",
        border: "var(--sv-warning-border)",
        text: "var(--sv-warning-text)",
      },
      error: {
        DEFAULT: "var(--sv-status-error)",
        subtle: "var(--sv-error-subtle)",
        border: "var(--sv-error-border)",
        text: "var(--sv-error-text)",
      },
      info: {
        DEFAULT: "var(--sv-status-info)",
        subtle: "var(--sv-info-subtle)",
        border: "var(--sv-info-border)",
        text: "var(--sv-info-text)",
      },
    },
  },
  radius: {
    xs: "var(--sv-radius-xs)",
    sm: "var(--sv-radius-sm)",
    md: "var(--sv-radius-md)",
    lg: "var(--sv-radius-lg)",
    xl: "var(--sv-radius-xl)",
    full: "var(--sv-radius-full)",
  },
  shadows: {
    sm: "var(--sv-shadow-sm)",
    md: "var(--sv-shadow-md)",
    lg: "var(--sv-shadow-lg)",
    xl: "var(--sv-shadow-xl)",
    glow: "var(--sv-shadow-glow)",
  },
  motion: {
    easeDefault: "var(--sv-ease-default)",
    easeIn: "var(--sv-ease-in)",
    easeOut: "var(--sv-ease-out)",
    easeSpring: "var(--sv-ease-spring)",
    durationFast: "var(--sv-duration-fast)",
    durationNormal: "var(--sv-duration-normal)",
    durationSlow: "var(--sv-duration-slow)",
  },
} as const;

export const playTokens = {
  colors: {
    bg: "var(--play-bg)",
    bgSubtle: "var(--play-bg-subtle)",
    surface: "var(--play-surface)",
    surfaceAlt: "var(--play-surface-alt)",
    surfaceSubtle: "var(--play-surface-subtle)",
    surfaceHover: "var(--play-surface-hover)",
    surfaceRaised: "var(--play-surface-raised)",
    border: "var(--play-border)",
    borderSubtle: "var(--play-border-subtle)",
    borderStrong: "var(--play-border-strong)",
    text: {
      DEFAULT: "var(--play-text)",
      primary: "var(--play-text)",
      secondary: "var(--play-text-secondary)",
      muted: "var(--play-text-muted)",
      light: "var(--play-text-light)",
      inverse: "var(--play-text-inverse)",
    },
    brand: {
      DEFAULT: "var(--play-brand)",
      hover: "var(--play-brand-hover)",
      dark: "var(--play-brand-dark)",
      light: "var(--play-brand-light)",
    },
    accent: {
      DEFAULT: "var(--play-accent)",
      hover: "var(--play-accent-hover)",
      subtle: "var(--play-accent-subtle)",
    },
    status: {
      success: {
        DEFAULT: "var(--play-status-success)",
        subtle: "var(--play-success-subtle)",
        border: "var(--play-success-border)",
        text: "var(--play-success-text)",
      },
      warning: {
        DEFAULT: "var(--play-status-warning)",
        subtle: "var(--play-warning-subtle)",
        border: "var(--play-warning-border)",
        text: "var(--play-warning-text)",
      },
      error: {
        DEFAULT: "var(--play-status-error)",
        subtle: "var(--play-error-subtle)",
        border: "var(--play-error-border)",
        text: "var(--play-error-text)",
      },
      info: {
        DEFAULT: "var(--play-status-info)",
        subtle: "var(--play-info-subtle)",
        border: "var(--play-info-border)",
        text: "var(--play-info-text)",
      },
    },
  },
  radius: {
    sm: "var(--play-radius-sm)",
    md: "var(--play-radius-md)",
    lg: "var(--play-radius-lg)",
    xl: "var(--play-radius-xl)",
    full: "var(--play-radius-full)",
    pill: "var(--play-radius-pill)",
  },
  shadows: {
    sm: "var(--play-shadow-sm)",
    md: "var(--play-shadow-md)",
    lg: "var(--play-shadow-lg)",
    xl: "var(--play-shadow-xl)",
    colored: "var(--play-shadow-colored)",
    inner: "var(--play-shadow-inner)",
  },
  motion: {
    easeDefault: "var(--play-ease-default)",
    easeSpring: "var(--play-ease-spring)",
    durationFast: "var(--play-duration-fast)",
    durationNormal: "var(--play-duration-normal)",
    durationSlow: "var(--play-duration-slow)",
  },
} as const;

export const rawAdminTokens = {
  bg: "#0b0d13",
  bgSubtle: "#11141d",
  bgSurface: "#161923",
  surface: "#161923",
  surfaceRaised: "#1f2333",
  surfaceHover: "#232738",
  surfaceActive: "#2a2f44",
  border: "#2a2d3e",
  borderSubtle: "#1d2130",
  borderFocus: "#4f5b8a",
  borderStrong: "#3c425b",
  textPrimary: "#f8fafc",
  textSecondary: "#94a3b8",
  textMuted: "#64748b",
  textDisabled: "#475569",
  textInverse: "#0b0d13",
  brand: "#f97316",
  brandHover: "#ea580c",
  brandSubtle: "rgba(249, 115, 22, 0.12)",
  brandForeground: "#ffffff",
  statusSuccess: "#10b981",
  statusWarning: "#f59e0b",
  statusError: "#ef4444",
  statusInfo: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export const rawPlayTokens = {
  bg: "#FAF5F0",
  bgSubtle: "#F5EFE8",
  surface: "#FFFFFF",
  surfaceAlt: "#F5F0EB",
  surfaceSubtle: "#F4EEE5",
  surfaceHover: "#EFE9E2",
  surfaceRaised: "#FFFFFF",
  border: "#e5e7eb",
  borderSubtle: "#f3f4f6",
  borderStrong: "#d1d5db",
  text: "#111827",
  textSecondary: "#635e57",
  textMuted: "#6b7280",
  textLight: "#9ca3af",
  textInverse: "#ffffff",
  brand: "#10b981",
  brandHover: "#059669",
  brandDark: "#059669",
  brandLight: "#d1fae5",
  accent: "#f97316",
  accentHover: "#ea580c",
  accentSubtle: "#ffedd5",
  statusSuccess: "#10b981",
  statusWarning: "#f59e0b",
  statusError: "#ef4444",
  statusInfo: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

export const tokens = {
  admin: adminTokens,
  play: playTokens,
  raw: {
    admin: rawAdminTokens,
    play: rawPlayTokens,
  },
} as const;

export type AdminTokens = typeof adminTokens;
export type PlayTokens = typeof playTokens;
export type RawAdminTokens = typeof rawAdminTokens;
export type RawPlayTokens = typeof rawPlayTokens;
export type Tokens = typeof tokens;

export default tokens;
