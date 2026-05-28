"use client";

interface PlatformResult {
  platform: string;
  success: boolean;
  error?: string;
  id?: string;
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
};

const PLATFORM_NOTES: Record<string, string> = {
  instagram: "Publicado",
  tiktok: "Enviado para inbox (adiciona legenda na app)",
  youtube: "Guardado como rascunho privado",
};

export default function StatusCard({ results }: { results: PlatformResult[] }) {
  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-lg font-semibold text-gray-800">Resultado</h2>
      {results.map((r) => (
        <div
          key={r.platform}
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            r.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          }`}
        >
          <span className="text-xl">{r.success ? "✅" : "❌"}</span>
          <div>
            <p className="font-medium text-gray-900">
              {PLATFORM_LABELS[r.platform] ?? r.platform}
            </p>
            <p className="text-sm text-gray-600">
              {r.success
                ? PLATFORM_NOTES[r.platform] ?? "Publicado"
                : `Erro: ${r.error}`}
            </p>
            {r.success && r.id && (
              <p className="mt-0.5 text-xs text-gray-400">ID: {r.id}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
