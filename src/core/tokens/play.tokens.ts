/**
 * SportsVilla Play Design Tokens
 * Typed constants for Play (--play-*) design system with raw hex values.
 */

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

export type PlayTokens = typeof playTokens;
export type RawPlayTokens = typeof rawPlayTokens;
