export interface TikTokResult {
  success: boolean;
  publishId?: string;
  error?: string;
}

export async function publishToTikTok(
  videoUrl: string,
  _caption: string
): Promise<TikTokResult> {
  const token = process.env.TIKTOK_ACCESS_TOKEN;

  if (!token) {
    return { success: false, error: "Missing TikTok credentials" };
  }

  try {
    const res = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          source_info: {
            source: "PULL_FROM_URL",
            video_url: videoUrl,
          },
        }),
      }
    );
    const data = await res.json();
    if (data.error?.code && data.error.code !== "ok") {
      throw new Error(data.error.message || "TikTok API error");
    }

    return { success: true, publishId: data.data?.publish_id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
