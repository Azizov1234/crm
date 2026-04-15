"use client";

import { Plus } from "lucide-react";

type GradientButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  icon?: "plus" | React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  style?: React.CSSProperties;
  className?: string; // kept for backward compat
};

export function GradientButton({
  children,
  onClick,
  type = "button",
  disabled,
  icon,
  size = "md",
  style,
}: GradientButtonProps) {
  const sizeMap: Record<string, React.CSSProperties> = {
    sm: { height: 34, padding: "0 14px", fontSize: 12.5 },
    md: { height: 38, padding: "0 16px", fontSize: 13.5 },
    lg: { height: 44, padding: "0 22px", fontSize: 14 },
    full: { height: 48, padding: "0 24px", fontSize: 15, width: "100%" },
  };

  const sizeStyle = sizeMap[size] ?? sizeMap.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        background: disabled
          ? "#c4cce8"
          : "linear-gradient(98deg, #2f66f4 0%, #4356e8 45%, #8342ef 100%)",
        color: "#ffffff",
        border: "none",
        borderRadius: 11,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.18s, transform 0.18s, box-shadow 0.18s",
        boxShadow: disabled ? "none" : "0 4px 16px -6px rgba(63,86,210,0.5)",
        letterSpacing: "0.01em",
        ...sizeStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.opacity = "0.9";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.opacity = "1";
        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
      }}
    >
      {icon === "plus" ? <Plus style={{ width: 16, height: 16 }} /> : icon}
      {children}
    </button>
  );
}
