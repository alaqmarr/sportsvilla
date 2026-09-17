import React, { forwardRef } from "react";

export type CardVariant = "default" | "raised" | "highlighted" | "ghost";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverEffect?: boolean;
}

const variantStyles: Record<CardVariant, string> = {
  default: "bg-sv-surface border border-sv-border shadow-sv-sm",
  raised: "bg-sv-surface-raised border border-sv-border shadow-sv-md",
  highlighted: "bg-sv-surface border border-sv-brand/50 shadow-sv-glow",
  ghost: "bg-transparent border border-dashed border-sv-border",
};

const paddingStyles: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-5",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "none",
      hoverEffect = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`rounded-sv-lg transition-all duration-sv-normal ${
          variantStyles[variant]
        } ${paddingStyles[padding]} ${
          hoverEffect
            ? "hover:border-sv-border-focus hover:shadow-sv-md hover:translate-y-[-1px]"
            : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", children, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-5 sm:p-6 pb-3 sm:pb-4 flex items-start justify-between gap-4 border-b border-sv-border-subtle ${className}`}
        {...props}
      >
        <div className="space-y-1 min-w-0 flex-1">{children}</div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg font-bold text-sv-text font-sans tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={`text-xs text-sv-text-muted leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <div ref={ref} className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-4 sm:p-6 pt-3 sm:pt-4 border-t border-sv-border-subtle flex items-center justify-between gap-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = "CardFooter";
