"use client";

import { X } from "lucide-react";

type ModalShellProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
};

export function ModalShell({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = 640,
}: ModalShellProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15,20,50,0.55)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: 20,
          boxShadow: "0 24px 64px -16px rgba(15,20,60,0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "fadeInUp 0.22s ease-out both",
        }}
      >
        {/* Gradient header */}
        <div
          style={{
            background:
              "linear-gradient(105deg, #1d3f9f 0%, #2a42b8 35%, #4d2898 100%)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* Icon circle */}
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {icon ?? (
              <span style={{ fontSize: 20, fontWeight: 700 }}>+</span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                fontFamily: "var(--font-space-grotesk), sans-serif",
              }}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                style={{
                  fontSize: 12.5,
                  color: "rgba(255,255,255,0.7)",
                  margin: "2px 0 0",
                }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.28)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)";
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {children}
        </div>

        {/* Footer */}
        {footer ? (
          <div
            style={{
              flexShrink: 0,
              padding: "14px 20px",
              borderTop: "1px solid #edf1fa",
              background: "#fafbff",
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
