/**
 * SportsVilla Centralised Design Tokens Mirror
 * Re-exports adminTokens, playTokens, and combined tokens for backward compatibility and tests.
 */
import { adminTokens, rawAdminTokens, AdminTokens, RawAdminTokens } from "./admin.tokens";
import { playTokens, rawPlayTokens, PlayTokens, RawPlayTokens } from "./play.tokens";

export { adminTokens, rawAdminTokens };
export type { AdminTokens, RawAdminTokens };
export { playTokens, rawPlayTokens };
export type { PlayTokens, RawPlayTokens };

export const tokens = {
  admin: adminTokens,
  play: playTokens,
  raw: {
    admin: rawAdminTokens,
    play: rawPlayTokens,
  },
} as const;

export type Tokens = typeof tokens;

export default tokens;
