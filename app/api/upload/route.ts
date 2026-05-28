import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 500 * 1024 * 1024) {
    return NextResponse.json({ error: "File exceeds 500MB limit" }, { status: 400 });
  }

  const blob = await put(file.name, file, { access: "public" });
  return NextResponse.json({ url: blob.url });
}
