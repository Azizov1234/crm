"use client";

import { SearchX } from "lucide-react";

type EmptyStateProps = {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  subtitle,
  icon: Icon,
  action,
}: EmptyStateProps) {
  const IconComponent = Icon ?? SearchX;

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e4e9f5",
        borderRadius: 18,
        boxShadow: "0 2px 12px -4px rgba(30,50,120,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "56px 24px",
        textAlign: "center",
        minHeight: 280,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #eef1ff 0%, #e8edff 100%)",
          border: "1.5px solid #d5dcf2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <IconComponent style={{ width: 32, height: 32, color: "#7286cc" }} />
      </div>
      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "#1e2340",
          margin: "0 0 6px",
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13.5,
          color: "#7a88ae",
          margin: 0,
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
      {action ? <div style={{ marginTop: 24 }}>{action}</div> : null}
    </div>
  );
}
