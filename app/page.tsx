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
    <main className="flex flex-col justify-between items-center min-h-dvh px-5 py-8 relative overflow-x-hidden font-[family-name:var(--font-main)] opacity-0 animate-[pageFadeIn_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]">
      {/* Ambient glow */}
      <div className="absolute -top-[20vh] left-1/2 -translate-x-1/2 w-[140vw] h-[70vh] bg-[radial-gradient(circle_at_center,rgba(255,111,174,0.07)_0%,transparent_65%)] pointer-none z-0 animate-[breathe_10s_ease-in-out_infinite_alternate]" />

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
      `}</style>

      {/* Header */}
      <header className="w-full max-w-[420px] flex justify-end z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.75rem] font-medium tracking-wide text-[var(--muted)] border border-[var(--border)] bg-[var(--card)]">
          <span className="size-1.5 rounded-full bg-[var(--online)] shadow-[0_0_8px_var(--online)] animate-[pulse_2s_infinite]" />
          ai.yuzuki.space
        </div>
      </header>

      {/* Center */}
      <div className="w-full max-w-[420px] flex flex-col gap-8 z-10 my-auto py-12">
        {/* Hero */}
        <div className="flex flex-col gap-3">
          <div className="size-7 rounded-full border-2 border-[var(--border)] mb-2 flex items-center justify-center relative">
            <span className="size-2 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight leading-tight text-[var(--text)]">
            Yuzu Companion
          </h1>
          <p className="text-[0.9375rem] font-light leading-relaxed text-[var(--muted)]">
            A thoughtful AI companion, crafted with care.
            <br />
            Currently under construction.
          </p>
        </div>

        {/* System Architecture Card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center text-[0.8125rem] font-medium">
            <span className="text-[var(--text)]">System Architecture</span>
            <span className="font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--accent)]">48%</span>
          </div>

          <div className="w-full h-1 rounded-full bg-[var(--border)] overflow-hidden">
            <div className="w-[48%] h-full bg-[var(--text)] rounded-full shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            {[
              { label: "Backend", done: true },
              { label: "Memory", done: true },
              { label: "Voice", done: false },
              { label: "Vision", done: false },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-2 text-[0.8125rem] text-[var(--muted)]">
                <span
                  className="text-[0.6rem]"
                  style={{ color: m.done ? "var(--text)" : "var(--border)" }}
                >
                  {m.done ? "●" : "○"}
                </span>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terminal */}
        <div className="font-[family-name:var(--font-mono)] text-[0.75rem] text-[var(--muted)] bg-black/30 border border-[var(--border)] rounded-xl p-4 min-h-[110px] flex flex-col gap-1.5">
          {TERMINAL_LINES.map((line, i) => (
            <div
              key={i}
              className="term-line leading-relaxed"
              data-delay={line.delay}
            >
              <span className="text-[var(--accent)] mr-1.5 select-none">&gt;</span>
              {line.text}
              {i === TERMINAL_LINES.length - 1 && (
                <span className="inline-block size-1.5 bg-[var(--muted)] ml-1 align-middle animate-[blink_1s_infinite]" />
              )}
            </div>
          ))}
          <style>{`
            .term-line { display: none; }
            .term-line.visible { display: block; animation: fadeIn 0.3s ease-out forwards; }
          `}</style>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-[420px] flex justify-between items-end text-[0.75rem] text-[var(--muted)] z-10 pt-4">
        <div>© 2026 icedeyes12</div>
        <div className="text-right leading-relaxed">
          Still learning.
          <br />
          Always listening.
        </div>
      </footer>
    </main>
  );
}
