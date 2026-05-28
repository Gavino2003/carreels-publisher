import { NextRequest, NextResponse } from "next/server";
import { publishToInstagram } from "@/lib/instagram";
import { publishToTikTok } from "@/lib/tiktok";
import { publishToYouTube } from "@/lib/youtube";

export interface PublishRequest {
  videoUrl: string;
  title: string;
  description: string;
  ownerInstagram: string;
  ownerTikTok: string;
  ownerYouTube: string;
  hashtags: string[];
  platforms: {
    instagram: boolean;
    tiktok: boolean;
    youtube: boolean;
  };
}

function buildInstagramCaption(description: string, owner: string, hashtags: string[]): string {
  const tags = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return `${description}\n\nCarro de ${owner} 🚗\n\n${tags}`.trim();
}

function buildTikTokCaption(description: string, owner: string, hashtags: string[]): string {
  const tags = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return `${description}\n\n${owner} ${tags}`.trim();
}

function buildYouTubeDescription(description: string, owner: string, hashtags: string[]): string {
  const tags = hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return `${description}\n\nOriginal creator: ${owner}\n\n${tags}`.trim();
}

export async function POST(req: NextRequest) {
  const body: PublishRequest = await req.json();
  const { videoUrl, title, description, ownerInstagram, ownerTikTok, ownerYouTube, hashtags, platforms } = body;

  if (!videoUrl) {
    return NextResponse.json({ error: "Missing video URL" }, { status: 400 });
  }

  const tasks: Promise<{ platform: string; success: boolean; error?: string; id?: string }>[] = [];

  if (platforms.instagram) {
    const caption = buildInstagramCaption(description, ownerInstagram, hashtags);
    tasks.push(
      publishToInstagram(videoUrl, caption).then((r) => ({
        platform: "instagram",
        success: r.success,
        error: r.error,
        id: r.postId,
      }))
    );
  }

  if (platforms.tiktok) {
    const caption = buildTikTokCaption(description, ownerTikTok, hashtags);
    tasks.push(
      publishToTikTok(videoUrl, caption).then((r) => ({
        platform: "tiktok",
        success: r.success,
        error: r.error,
        id: r.publishId,
      }))
    );
  }

  if (platforms.youtube) {
    const ytDescription = buildYouTubeDescription(description, ownerYouTube, hashtags);
    tasks.push(
      publishToYouTube(videoUrl, title, ytDescription).then((r) => ({
        platform: "youtube",
        success: r.success,
        error: r.error,
        id: r.videoId,
      }))
    );
  }

  const settled = await Promise.allSettled(tasks);
  const results = settled.map((s) =>
    s.status === "fulfilled"
      ? s.value
      : { platform: "unknown", success: false, error: String(s.reason) }
  );

  return NextResponse.json({ results });
}
