import React from "react";
import Image from "next/image";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  role?: string;
  showRoleBadge?: boolean;
  status?: "online" | "offline" | "busy";
}

const sizeMap: Record<
  AvatarSize,
  {
    box: string;
    text: string;
    badge: string;
    px: number;
  }
> = {
  xs: { box: "w-6 h-6", text: "text-[10px]", badge: "w-1.5 h-1.5", px: 24 },
  sm: { box: "w-8 h-8", text: "text-xs", badge: "w-2 h-2", px: 32 },
  md: { box: "w-10 h-10", text: "text-sm", badge: "w-2.5 h-2.5", px: 40 },
  lg: { box: "w-12 h-12", text: "text-base", badge: "w-3 h-3", px: 48 },
  xl: { box: "w-14 h-14", text: "text-lg", badge: "w-3.5 h-3.5", px: 56 },
};

function getInitials(name?: string | null): string {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getGradient(name?: string | null): string {
  if (!name) return "from-sv-brand/30 to-sv-brand/10 text-sv-brand";
  const charCode = name.charCodeAt(0) || 0;
  if (charCode % 4 === 0) return "from-sv-brand/30 to-sv-brand/10 text-sv-brand";
  if (charCode % 4 === 1) return "from-sv-success/30 to-sv-success/10 text-sv-success-text";
  if (charCode % 4 === 2) return "from-sv-info/30 to-sv-info/10 text-sv-info-text";
  return "from-purple-500/30 to-purple-500/10 text-purple-400";
}

export function Avatar({
  src,
  name,
  size = "md",
  role,
  showRoleBadge = false,
  status,
  className = "",
  ...props
}: AvatarProps) {
  const config = sizeMap[size];
  const initials = getInitials(name);
  const gradient = getGradient(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${config.box} ${className}`}
      {...props}
    >
      <div
        className={`w-full h-full rounded-full overflow-hidden border border-sv-border flex items-center justify-center font-bold font-sans bg-gradient-to-br select-none ${gradient}`}
      >
        {src ? (
          <Image
            src={src}
            alt={name || "User Avatar"}
            width={config.px}
            height={config.px}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={config.text}>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-sv-surface ${config.badge} ${
            status === "online"
              ? "bg-sv-status-success"
              : status === "busy"
              ? "bg-sv-status-error"
              : "bg-sv-text-muted"
          }`}
          aria-hidden="true"
        />
      )}

      {showRoleBadge && role && (
        <span
          className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-sv-xs text-[9px] font-extrabold uppercase tracking-wider bg-sv-surface-raised border border-sv-border text-sv-text"
          title={`Role: ${role}`}
        >
          {role === "SUPERADMIN" ? "SA" : "AD"}
        </span>
      )}
    </div>
  );
}
