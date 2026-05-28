export interface YouTubeResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to refresh YouTube access token");
  return data.access_token;
}

export async function publishToYouTube(
  videoUrl: string,
  title: string,
  description: string
): Promise<YouTubeResult> {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return { success: false, error: "Missing YouTube credentials" };
  }

  try {
    const accessToken = await getAccessToken();

    // Fetch the video from the URL
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error("Failed to fetch video from URL");
    const videoBlob = await videoRes.blob();

    // Step 1: Initiate resumable upload
    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/mp4",
          "X-Upload-Content-Length": String(videoBlob.size),
        },
        body: JSON.stringify({
          snippet: { title, description },
          status: { privacyStatus: "private" },
        }),
      }
    );

    if (!initRes.ok) {
      const err = await initRes.json();
      throw new Error(err.error?.message || "Failed to initiate YouTube upload");
    }

    const uploadUrl = initRes.headers.get("Location");
    if (!uploadUrl) throw new Error("No upload URL from YouTube");

    // Step 2: Upload the video bytes
    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "video/mp4" },
      body: videoBlob,
    });

    const uploadData = await uploadRes.json();
    if (!uploadData.id) {
      throw new Error(uploadData.error?.message || "YouTube upload failed");
    }

    return { success: true, videoId: uploadData.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
