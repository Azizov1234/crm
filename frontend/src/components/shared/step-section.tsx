"use client";

type StepSectionProps = {
  number?: number;
  step?: number;   // alias for number (backward compat)
  title: string;
  hint?: string;   // alias for subtitle (ignored, kept for compat)
  action?: React.ReactNode;
  children: React.ReactNode;
};

export function StepSection({ number, step, title, action, children }: StepSectionProps) {
  const badgeNum = number ?? step ?? 1;
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Step badge */}
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4f63de, #8342ef)",
              color: "#ffffff",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {badgeNum}
          </div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1e2340",
              margin: 0,
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            {title}
          </h3>
        </div>
        {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#edf1fa", marginBottom: 14 }} />

      {/* Content */}
      {children}
    </div>
  );
}
