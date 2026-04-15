"use client";

type PageHeroProps = {
  title: string;
  subtitle: string;
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  statLabel?: string;
  statValue?: string | number;
  extraStat?: { label: string; value: string | number };
  className?: string;
};

export function PageHero({
  title,
  subtitle,
  icon: Icon,
  statLabel,
  statValue,
  extraStat,
}: PageHeroProps) {
  return (
    <section
      style={{
        background:
          "linear-gradient(105deg, #1d3f9f 0%, #2a42b8 35%, #4d2898 100%)",
        borderRadius: 20,
        padding: "22px 28px",
        color: "#fff",
        boxShadow: "0 12px 32px -16px rgba(30,50,140,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Mesh circles */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 80% 120%, rgba(130,56,230,0.35) 0%, transparent 55%), radial-gradient(circle at 5% 5%, rgba(56,102,240,0.3) 0%, transparent 50%)",
        }}
      />

      {/* Left: icon + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
        {Icon ? (
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "rgba(255,255,255,0.13)",
              border: "1px solid rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon style={{ width: 26, height: 26, color: "#fff" }} />
          </div>
        ) : null}
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.2,
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.72)",
              margin: "4px 0 0",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: stat pills */}
      <div style={{ display: "flex", gap: 10, flexShrink: 0, position: "relative" }}>
        {statLabel && statValue !== undefined ? (
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 14,
              padding: "8px 16px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.65)",
                margin: 0,
              }}
            >
              {statLabel}
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#ffffff",
                margin: "2px 0 0",
                lineHeight: 1,
              }}
            >
              {statValue}
            </p>
          </div>
        ) : null}

        {extraStat ? (
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 14,
              padding: "8px 16px",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.65)",
                margin: 0,
              }}
            >
              {extraStat.label}
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#ffffff",
                margin: "2px 0 0",
                lineHeight: 1,
              }}
            >
              {extraStat.value}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
