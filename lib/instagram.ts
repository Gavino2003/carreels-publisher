export interface InstagramResult {
  success: boolean;
  postId?: string;
  error?: string;
}

async function pollContainerStatus(containerId: string, token: string): Promise<boolean> {
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${containerId}?fields=status_code&access_token=${token}`
    );
    const data = await res.json();
    if (data.status_code === "FINISHED") return true;
    if (data.status_code === "ERROR") throw new Error("Instagram container processing failed");
  }
  throw new Error("Instagram container timed out after 50 seconds");
}

export async function publishToInstagram(
  videoUrl: string,
  caption: string
): Promise<InstagramResult> {
  const userId = process.env.INSTAGRAM_USER_ID;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!userId || !token) {
    return { success: false, error: "Missing Instagram credentials" };
  }

  try {
    // Step 1: Create media container
    const createRes = await fetch(
      `https://graph.facebook.com/v19.0/${userId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_type: "REELS",
          video_url: videoUrl,
          caption,
          access_token: token,
        }),
      }
    );
    const createData = await createRes.json();
    if (!createData.id) {
      throw new Error(createData.error?.message || "Failed to create media container");
    }

    // Step 2: Poll until processing is done
    await pollContainerStatus(createData.id, token);

    // Step 3: Publish
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${userId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: token,
        }),
      }
    );
    const publishData = await publishRes.json();
    if (!publishData.id) {
      throw new Error(publishData.error?.message || "Failed to publish to Instagram");
    }

    return { success: true, postId: publishData.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
