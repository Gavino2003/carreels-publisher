"use client";

import { useEffect, useState } from "react";

interface PlatformResult {
  platform: string;
  success: boolean;
  error?: string;
  id?: string;
}

const META: Record<string, { label: string; successNote: string; color: string; bg: string; border: string }> = {
  instagram: {
    label: "Instagram",
    successNote: "Publicado",
    color: "text-pink-300",
    bg: "bg-pink-500/10",
    border: "border-pink-500/25",
  },
  tiktok: {
    label: "TikTok",
    successNote: "Enviado para inbox — adiciona a legenda na app",
    color: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/25",
  },
  youtube: {
    label: "YouTube",
    successNote: "Guardado como rascunho privado",
    color: "text-red-300",
    bg: "bg-red-500/10",
    border: "border-red-500/25",
  },
};

function ResultRow({ r, index }: { r: PlatformResult; index: number }) {
  const [visible, setVisible] = useState(false);
  const m = META[r.platform] ?? { label: r.platform, successNote: "Publicado", color: "text-white", bg: "bg-white/5", border: "border-white/10" };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 transition-all duration-500 ${
        r.success ? `${m.bg} ${m.border}` : "bg-red-500/8 border-red-500/25"
      } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <span className="text-lg mt-0.5">{r.success ? "✅" : "❌"}</span>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${r.success ? m.color : "text-red-300"}`}>
          {m.label}
        </p>
        <p className="text-xs text-white/45 mt-0.5">
          {r.success ? m.successNote : `Erro: ${r.error}`}
        </p>
        {r.success && r.id && (
          <p className="text-[10px] text-white/20 mt-1 font-mono truncate">ID: {r.id}</p>
        )}
      </div>
    </div>
  );
}

export default function StatusCard({ results }: { results: PlatformResult[] }) {
  return (
    <div className="space-y-3 pt-2">
      <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Resultado</p>
      {results.map((r, i) => (
        <ResultRow key={r.platform} r={r} index={i} />
      ))}
    </div>
  );
}
