export async function POST(request: Request) {
  const { getRandomApiKey } = await import("@/lib/ai/models");
  const apiKey = getRandomApiKey();
  if (!apiKey) {
    return Response.json(
      { error: "STT service not configured" },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio") as Blob | null;
  if (!audio) {
    return Response.json({ error: "No audio provided" }, { status: 400 });
  }

  const fireworksForm = new FormData();
  fireworksForm.append("file", audio, "audio.webm");
  fireworksForm.append("model", "whisper-v3-turbo");
  fireworksForm.append("language", "en");
  fireworksForm.append("response_format", "json");

  const res = await fetch(
    "https://audio-turbo.api.fireworks.ai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: fireworksForm,
    },
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("[STT] Fireworks error:", res.status, error);
    return Response.json(
      { error: "Transcription failed" },
      { status: res.status },
    );
  }

  const data = await res.json();
  return Response.json({ text: data.text || "" });
}

