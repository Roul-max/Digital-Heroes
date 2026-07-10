"use client";

import { useEffect, useState } from "react";

function formatDuration(ms: number): string {
  if (ms <= 0) return "Breached";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

export function SlaCountdown({ routedAt, slaHours = 2 }: { routedAt: Date; slaHours?: number }) {
  const deadline = new Date(routedAt).getTime() + slaHours * 60 * 60 * 1000;

  // Lazy initializer runs once on mount — safe, not during render
  const [remaining, setRemaining] = useState<number>(() => deadline - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(deadline - Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  const breached = remaining <= 0;

  return (
    <span
      className={`text-xs font-mono font-medium ${
        breached
          ? "text-red-600"
          : remaining < 30 * 60 * 1000
          ? "text-amber-600"
          : "text-neutral-600"
      }`}
      aria-label={`SLA: ${formatDuration(remaining)}`}
    >
      {formatDuration(remaining)}
    </span>
  );
}
