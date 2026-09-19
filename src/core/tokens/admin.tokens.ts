/**
 * SportsVilla Admin Design Tokens
 * Typed constants for Admin (--sv-*) design system with raw hex values.
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

export type AdminTokens = typeof adminTokens;
export type RawAdminTokens = typeof rawAdminTokens;
