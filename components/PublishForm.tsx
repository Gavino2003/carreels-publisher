"use client";

import { useState } from "react";
import StatusCard from "./StatusCard";

interface PlatformResult {
  platform: string;
  success: boolean;
  error?: string;
  id?: string;
}

type VideoSource = "file" | "url";

export default function PublishForm() {
  const [videoSource, setVideoSource] = useState<VideoSource>("file");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ownerInstagram, setOwnerInstagram] = useState("");
  const [ownerTikTok, setOwnerTikTok] = useState("");
  const [ownerYouTube, setOwnerYouTube] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [platforms, setPlatforms] = useState({
    instagram: true,
    tiktok: true,
    youtube: true,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlatformResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const togglePlatform = (p: keyof typeof platforms) => {
    setPlatforms((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    const anyPlatform = Object.values(platforms).some(Boolean);
    if (!anyPlatform) {
      setError("Seleciona pelo menos uma plataforma.");
      return;
    }

    setLoading(true);
    try {
      let finalUrl = videoUrl;

      // If file upload, send to Vercel Blob first
      if (videoSource === "file") {
        if (!videoFile) throw new Error("Seleciona um ficheiro de vídeo.");
        const fd = new FormData();
        fd.append("file", videoFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Falha no upload do vídeo.");
        finalUrl = uploadData.url;
      } else {
        if (!finalUrl.trim()) throw new Error("Introduz um URL de vídeo válido.");
      }

      const hashtagList = hashtags
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

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
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Video source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fonte do Vídeo</label>
        <div className="flex gap-4">
          {(["file", "url"] as VideoSource[]).map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="videoSource"
                value={s}
                checked={videoSource === s}
                onChange={() => setVideoSource(s)}
                className="accent-indigo-600"
              />
              <span className="text-sm text-gray-700">
                {s === "file" ? "Upload de ficheiro" : "URL público"}
              </span>
            </label>
          ))}
        </div>

        {videoSource === "file" ? (
          <input
            type="file"
            accept="video/mp4"
            className="mt-3 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
          />
        ) : (
          <input
            type="url"
            placeholder="https://exemplo.com/video.mp4"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="mt-3 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-gray-400">(YouTube)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título do vídeo"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição / Caption</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Texto base partilhado em todas as plataformas"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Owner handles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Instagram @handle</label>
          <input
            type="text"
            value={ownerInstagram}
            onChange={(e) => setOwnerInstagram(e.target.value)}
            placeholder="@dono"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TikTok @handle</label>
          <input
            type="text"
            value={ownerTikTok}
            onChange={(e) => setOwnerTikTok(e.target.value)}
            placeholder="@dono"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            YouTube <span className="text-gray-400">(opcional)</span>
          </label>
          <input
            type="text"
            value={ownerYouTube}
            onChange={(e) => setOwnerYouTube(e.target.value)}
            placeholder="@canal ou nome"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="carros, supercar, luxo"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="mt-1 text-xs text-gray-400">Separadas por vírgula — o # é adicionado automaticamente</p>
      </div>

      {/* Platform toggles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Plataformas</label>
        <div className="flex flex-wrap gap-3">
          {(["instagram", "tiktok", "youtube"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePlatform(p)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                platforms[p]
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:border-indigo-400"
              }`}
            >
              {platforms[p] ? "✓" : "○"}{" "}
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
            </svg>
            A publicar…
          </span>
        ) : (
          "Publish to All"
        )}
      </button>

      {results && <StatusCard results={results} />}
    </form>
  );
}
