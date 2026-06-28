"use client";

import { useEffect } from "react";

const TERMINAL_LINES = [
  { text: "boot sequence initiated...", delay: 600 },
  { text: "loading personality traits...", delay: 2200 },
  { text: "attaching postgres vector memory...", delay: 4000 },
  { text: "waiting for first conversation...", delay: 6200 },
];

export default function Home() {
  useEffect(() => {
    const lines = document.querySelectorAll(".term-line");
    lines.forEach((line) => {
      const delay = parseInt(line.getAttribute("data-delay") || "0", 10);
      setTimeout(() => line.classList.add("visible"), delay);
    });
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.ambientGlow} />
      <style>{`
        @keyframes breathe {
          0% { opacity: 0.6; transform: translateX(-50%) scale(0.98); }
          100% { opacity: 1; transform: translateX(-50%) scale(1.04); }
        }
        @keyframes pageFadeIn { to { opacity: 1; } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .term-line { display: none; }
        .term-line.visible { display: block; animation: fadeIn 0.3s ease-out forwards; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.statusPill}>
          <span style={styles.statusDot} />
          <span>ai.yuzuki.space</span>
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        {/* Hero */}
        <div style={styles.hero}>
          <div style={styles.logoMark}>
            <span style={styles.logoDot} />
          </div>
          <h1 style={styles.h1}>Yuzu Companion</h1>
          <p style={styles.subtitle}>
            A thoughtful AI companion, crafted with care.
            <br />
            Currently under construction.
          </p>
        </div>

        {/* System Architecture Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span>System Architecture</span>
            <span style={styles.percentage}>48%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={styles.progressFill} />
          </div>
          <div style={styles.metrics}>
            {[
              { label: "Backend", done: true },
              { label: "Memory", done: true },
              { label: "Voice", done: false },
              { label: "Vision", done: false },
            ].map((m) => (
              <div key={m.label} style={styles.metricItem}>
                <span
                  style={{
                    fontSize: "0.6rem",
                    color: m.done ? "var(--text)" : "var(--border)",
                  }}
                >
                  {m.done ? "●" : "○"}
                </span>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal */}
        <div style={styles.terminal}>
          {TERMINAL_LINES.map((line, i) => (
            <div key={i} className="term-line" data-delay={line.delay} style={styles.termLine}>
              <span style={styles.prefix}>&gt;</span>
              {line.text}
              {i === TERMINAL_LINES.length - 1 && (
                <span style={styles.cursor} />
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div>© 2026 icedeyes12</div>
        <div style={styles.footerTagline}>
          Still learning.
          <br />
          Always listening.
        </div>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    backgroundColor: "#09090B",
    color: "#FAFAFA",
    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, sans-serif",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    overflowX: "hidden",
    padding: "2rem 1.25rem",
    opacity: 0,
    animation: "pageFadeIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
  },
  ambientGlow: {
    position: "absolute",
    top: "-20vh",
    left: "50%",
    transform: "translateX(-50%)",
    width: "140vw",
    height: "70vh",
    background:
      "radial-gradient(circle at center, rgba(255, 111, 174, 0.07) 0%, transparent 65%)",
    zIndex: 0,
    pointerEvents: "none",
    animation: "breathe 10s ease-in-out infinite alternate",
  },
  header: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 1,
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#111113",
    border: "1px solid #27272A",
    padding: "6px 12px",
    borderRadius: 9999,
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#A1A1AA",
    letterSpacing: "0.02em",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#10B981",
    boxShadow: "0 0 8px #10B981",
    animation: "pulse 2s infinite",
  },
  main: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    zIndex: 1,
    margin: "auto 0",
    padding: "3rem 0",
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "2px solid #27272A",
    marginBottom: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#FF6FAE",
    boxShadow: "0 0 10px #FF6FAE",
  },
  h1: {
    fontSize: "1.875rem",
    fontWeight: 600,
    letterSpacing: "-0.03em",
    lineHeight: 1.2,
    margin: 0,
  },
  subtitle: {
    color: "#A1A1AA",
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    fontWeight: 300,
    margin: 0,
  },
  card: {
    backgroundColor: "#111113",
    border: "1px solid #27272A",
    borderRadius: 16,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.8125rem",
    fontWeight: 500,
  },
  percentage: {
    fontFamily: "'IBM Plex Mono', monospace",
    color: "#FF6FAE",
    fontSize: "0.75rem",
  },
  progressTrack: {
    width: "100%",
    height: 4,
    backgroundColor: "#27272A",
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressFill: {
    width: "48%",
    height: "100%",
    backgroundColor: "#FAFAFA",
    borderRadius: 9999,
    boxShadow: "0 0 12px rgba(255, 255, 255, 0.4)",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    paddingTop: "0.25rem",
  },
  metricItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "0.8125rem",
    color: "#A1A1AA",
  },
  terminal: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "0.75rem",
    color: "#A1A1AA",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid #27272A",
    borderRadius: 12,
    padding: "1rem 1.25rem",
    minHeight: 110,
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
  },
  termLine: {
    lineHeight: 1.4,
  },
  prefix: {
    color: "#FF6FAE",
    marginRight: 6,
    userSelect: "none",
  },
  cursor: {
    display: "inline-block",
    width: 6,
    height: 13,
    backgroundColor: "#A1A1AA",
    verticalAlign: "middle",
    marginLeft: 4,
    animation: "blink 1s infinite",
  },
  footer: {
    width: "100%",
    maxWidth: 420,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    fontSize: "0.75rem",
    color: "#A1A1AA",
    zIndex: 1,
    paddingTop: "1rem",
  },
  footerTagline: {
    textAlign: "right",
    lineHeight: 1.4,
  },
};
