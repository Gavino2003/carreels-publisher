"use client";

import React, { useState, useEffect, useRef } from "react";
import StatusCard from "./StatusCard";

interface PlatformResult {
  platform: string;
  success: boolean;
  error?: string;
  id?: string;
}

type VideoSource = "file" | "url";

// Saved handle entry: stores instagram/tiktok/youtube together as a "owner preset"
interface OwnerPreset {
  id: string;
  label: string; // display name, e.g. "@joaocars"
  instagram: string;
  tiktok: string;
  youtube: string;
}

const LS_KEY = "cr_owner_presets";

function loadPresets(): OwnerPreset[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function savePresets(p: OwnerPreset[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

// Instagram-specific tag suggestions (separate from owner presets)
const LS_IG_TAGS = "cr_ig_tags";
function loadIgTags(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_IG_TAGS) ?? "[]"); } catch { return []; }
}
function saveIgTags(t: string[]) { localStorage.setItem(LS_IG_TAGS, JSON.stringify(t)); }

// ─── small sub-components ────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
      {children}
    </label>
  );
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input(props, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={`block w-full rounded-xl px-4 py-2.5 text-sm ${props.className ?? ""}`}
      />
    );
  }
);

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`block w-full rounded-xl px-4 py-2.5 text-sm resize-none ${props.className ?? ""}`}
    />
  );
}

// Tag chip (for saved handles + ig mentions)
function Chip({
  label,
  onClick,
  onRemove,
  active,
}: {
  label: string;
  onClick?: () => void;
  onRemove?: () => void;
  active?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-all duration-150 select-none
        ${active
          ? "bg-violet-600/30 text-violet-200 border border-violet-500/50"
          : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white/80"
        }`}
      onClick={onClick}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 text-white/30 hover:text-white/70"
        >
          ×
        </button>
      )}
    </span>
  );
}

// Platform icon SVGs (inline, no external dependency)
function IgIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z" />
    </svg>
  );
}

function YtIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const PLATFORM_META = {
  instagram: { label: "Instagram", icon: <IgIcon />, color: "from-pink-600 to-orange-500", active: "border-pink-500/60 bg-pink-500/15 text-pink-300" },
  tiktok:    { label: "TikTok",    icon: <TkIcon />, color: "from-sky-400 to-teal-400",   active: "border-sky-500/60 bg-sky-500/15 text-sky-300" },
  youtube:   { label: "YouTube",   icon: <YtIcon />, color: "from-red-500 to-rose-600",   active: "border-red-500/60 bg-red-500/15 text-red-300" },
} as const;

// ─── main component ───────────────────────────────────────────────────────────

export default function PublishForm() {
  const [videoSource, setVideoSource] = useState<VideoSource>("file");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [ownerInstagram, setOwnerInstagram] = useState("");
  const [ownerTikTok, setOwnerTikTok] = useState("");
  const [ownerYouTube, setOwnerYouTube] = useState("");

  // Extra Instagram mentions (the "list" feature)
  const [igMentions, setIgMentions] = useState("");
  const [savedIgTags, setSavedIgTags] = useState<string[]>([]);

  const [hashtags, setHashtags] = useState("");
  const [platforms, setPlatforms] = useState({ instagram: true, tiktok: true, youtube: true });

  // Owner presets
  const [presets, setPresets] = useState<OwnerPreset[]>([]);
  const [presetLabel, setPresetLabel] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [results, setResults] = useState<PlatformResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const igMentionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPresets(loadPresets());
    setSavedIgTags(loadIgTags());
  }, []);

  const applyPreset = (p: OwnerPreset) => {
    setOwnerInstagram(p.instagram);
    setOwnerTikTok(p.tiktok);
    setOwnerYouTube(p.youtube);
  };

  const saveCurrentPreset = () => {
    if (!presetLabel.trim()) return;
    const next: OwnerPreset = {
      id: Date.now().toString(),
      label: presetLabel.trim(),
      instagram: ownerInstagram,
      tiktok: ownerTikTok,
      youtube: ownerYouTube,
    };
    const updated = [next, ...presets];
    setPresets(updated);
    savePresets(updated);
    setPresetLabel("");
    setShowSavePreset(false);
  };

  const deletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id);
    setPresets(updated);
    savePresets(updated);
  };

  // Add an ig mention tag (saves to localStorage)
  const addIgTag = (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;
    const handle = clean.startsWith("@") ? clean : `@${clean}`;
    if (savedIgTags.includes(handle)) return;
    const updated = [handle, ...savedIgTags];
    setSavedIgTags(updated);
    saveIgTags(updated);
  };

  const removeIgTag = (tag: string) => {
    const updated = savedIgTags.filter((t) => t !== tag);
    setSavedIgTags(updated);
    saveIgTags(updated);
  };

  const appendIgMention = (tag: string) => {
    setIgMentions((prev) => {
      const parts = prev.split(" ").filter(Boolean);
      if (parts.includes(tag)) return prev;
      return [...parts, tag].join(" ");
    });
  };

  const handleIgTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = (e.target as HTMLInputElement).value.trim();
      if (val) { addIgTag(val); appendIgMention(val.startsWith("@") ? val : `@${val}`); (e.target as HTMLInputElement).value = ""; }
    }
  };

  const togglePlatform = (p: keyof typeof platforms) =>
    setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);
    if (!Object.values(platforms).some(Boolean)) {
      setError("Seleciona pelo menos uma plataforma.");
      return;
    }
    setLoading(true);
    try {
      let finalUrl = videoUrl;
      if (videoSource === "file") {
        if (!videoFile) throw new Error("Seleciona um ficheiro de vídeo.");
        setLoadingStep("A fazer upload do vídeo…");
        const fd = new FormData();
        fd.append("file", videoFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Falha no upload do vídeo.");
        finalUrl = uploadData.url;
      } else {
        if (!finalUrl.trim()) throw new Error("Introduz um URL de vídeo válido.");
      }

      setLoadingStep("A publicar nas plataformas…");

      const hashtagList = hashtags.split(",").map((h) => h.trim()).filter(Boolean);
      const igMentionList = igMentions.split(" ").map((m) => m.trim()).filter(Boolean);

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: finalUrl,
          title,
          description,
          ownerInstagram,
          ownerTikTok,
          ownerYouTube,
          igMentions: igMentionList,
          hashtags: hashtagList,
          platforms,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro desconhecido.");
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">

      {/* ── Video source ── */}
      <section className="animate-fade-in space-y-3">
        <Label>Fonte do vídeo</Label>
        <div className="flex gap-3">
          {(["file", "url"] as VideoSource[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setVideoSource(s)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                videoSource === s
                  ? "border-violet-500/60 bg-violet-500/15 text-violet-200"
                  : "border-white/8 bg-white/4 text-white/40 hover:text-white/60 hover:bg-white/7"
              }`}
            >
              {s === "file" ? "📁 Upload .mp4" : "🔗 URL público"}
            </button>
          ))}
        </div>
        {videoSource === "file" ? (
          <input
            type="file"
            accept="video/mp4"
            className="block w-full text-sm text-white/50 cursor-pointer"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
        ) : (
          <Input
            type="url"
            placeholder="https://exemplo.com/video.mp4"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
        )}
      </section>

      {/* ── Title ── */}
      <section className="animate-fade-in space-y-2" style={{ animationDelay: "0.05s" }}>
        <Label>Título <span className="normal-case text-white/25">(YouTube)</span></Label>
        <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do vídeo" />
      </section>

      {/* ── Description ── */}
      <section className="animate-fade-in space-y-2" style={{ animationDelay: "0.08s" }}>
        <Label>Descrição / Caption</Label>
        <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Texto base para todas as plataformas…" />
      </section>

      {/* ── Owner handles + presets ── */}
      <section className="animate-fade-in space-y-3" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between">
          <Label>Dono do carro</Label>
          <button
            type="button"
            onClick={() => setShowSavePreset((v) => !v)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            {showSavePreset ? "Cancelar" : "+ Guardar preset"}
          </button>
        </div>

        {/* Saved presets list */}
        {presets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Chip
                key={p.id}
                label={p.label}
                onClick={() => applyPreset(p)}
                onRemove={() => deletePreset(p.id)}
              />
            ))}
          </div>
        )}

        {/* Save preset row */}
        {showSavePreset && (
          <div className="flex gap-2 animate-slide-in">
            <Input
              type="text"
              placeholder="Nome do preset (ex: @joaocars)"
              value={presetLabel}
              onChange={(e) => setPresetLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveCurrentPreset(); } }}
            />
            <button
              type="button"
              onClick={saveCurrentPreset}
              className="px-4 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-200 text-sm font-medium hover:bg-violet-600/50 transition-colors whitespace-nowrap"
            >
              Guardar
            </button>
          </div>
        )}

        {/* Platform handle inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["instagram", "tiktok", "youtube"] as const).map((p) => (
            <div key={p}>
              <div className={`flex items-center gap-1.5 mb-1.5 text-xs font-medium ${
                p === "instagram" ? "text-pink-400" : p === "tiktok" ? "text-sky-400" : "text-red-400"
              }`}>
                {PLATFORM_META[p].icon}
                {PLATFORM_META[p].label}
              </div>
              <Input
                type="text"
                placeholder="@handle ou nome"
                value={p === "instagram" ? ownerInstagram : p === "tiktok" ? ownerTikTok : ownerYouTube}
                onChange={(e) =>
                  p === "instagram" ? setOwnerInstagram(e.target.value)
                  : p === "tiktok" ? setOwnerTikTok(e.target.value)
                  : setOwnerYouTube(e.target.value)
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Instagram extra mentions ── */}
      <section className="animate-fade-in space-y-2" style={{ animationDelay: "0.12s" }}>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-pink-400/80 uppercase tracking-wider flex items-center gap-1.5">
            <IgIcon /> Identificações Instagram
          </div>
          <span className="text-xs text-white/25">(adicionadas à caption)</span>
        </div>

        {/* Saved ig tags */}
        {savedIgTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {savedIgTags.map((tag) => {
              const active = igMentions.includes(tag);
              return (
                <Chip
                  key={tag}
                  label={tag}
                  active={active}
                  onClick={() => active
                    ? setIgMentions((prev) => prev.replace(tag, "").replace(/  +/, " ").trim())
                    : appendIgMention(tag)
                  }
                  onRemove={() => removeIgTag(tag)}
                />
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            ref={igMentionInputRef}
            type="text"
            placeholder="@conta  — Enter para guardar na lista"
            onKeyDown={handleIgTagKeyDown}
          />
        </div>
        {igMentions && (
          <p className="text-xs text-white/30">
            Na caption: <span className="text-pink-300/60">{igMentions}</span>
          </p>
        )}
      </section>

      {/* ── Hashtags ── */}
      <section className="animate-fade-in space-y-2" style={{ animationDelay: "0.14s" }}>
        <Label>Hashtags</Label>
        <Input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="carros, supercar, luxo"
        />
        <p className="text-xs text-white/25">Separadas por vírgula — o # é adicionado automaticamente</p>
      </section>

      {/* ── Platform toggles ── */}
      <section className="animate-fade-in space-y-3" style={{ animationDelay: "0.16s" }}>
        <Label>Plataformas</Label>
        <div className="grid grid-cols-3 gap-3">
          {(["instagram", "tiktok", "youtube"] as const).map((p) => {
            const meta = PLATFORM_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePlatform(p)}
                className={`flex flex-col items-center gap-2 py-3 rounded-xl border font-medium text-sm transition-all duration-200 ${
                  platforms[p]
                    ? meta.active
                    : "border-white/8 bg-white/3 text-white/30 hover:text-white/50 hover:bg-white/6"
                }`}
              >
                <span className={platforms[p] ? "" : "opacity-40"}>{meta.icon}</span>
                <span className="text-xs">{meta.label}</span>
                {platforms[p] && <span className="text-[10px] opacity-60">✓ activo</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Error ── */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 animate-slide-in">
          {error}
        </div>
      )}

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-6 py-3.5 text-base font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 animate-pulse-glow"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            {loadingStep || "A publicar…"}
          </span>
        ) : "🚀 Publish to All"}
      </button>

      {/* ── Results ── */}
      {results && <StatusCard results={results} />}
    </form>
  );
}
