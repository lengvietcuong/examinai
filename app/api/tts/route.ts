import { after } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BUCKET = "tts-cache";

async function hashText(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(req: Request) {
  const { text } = await req.json();
  const hash = await hashText(text);
  const filePath = `${hash}.mp3`;

  const supabase = createServerSupabaseClient();

  // Check cache
  const { data: cached } = await supabase.storage
    .from(BUCKET)
    .download(filePath);

  if (cached) {
    return new Response(cached, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  }

  // Generate from Deepgram
  const response = await fetch(
    "https://api.deepgram.com/v1/speak?model=aura-2-odysseus-en",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "text/plain",
      },
      body: text,
    },
  );

  if (!response.ok) {
    return new Response("TTS failed", { status: response.status });
  }

  const audioBuffer = await response.arrayBuffer();

  // Store to cache in background (doesn't delay the response)
  after(async () => {
    await supabase.storage
      .from(BUCKET)
      .upload(filePath, Buffer.from(audioBuffer), {
        contentType: "audio/mpeg",
        upsert: true,
      });
  });

  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
