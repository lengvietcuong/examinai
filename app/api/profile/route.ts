import { getProfile, updateSpeakingAutoplay } from "@/lib/db/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json(null);
  const profile = await getProfile(userId);
  return Response.json(profile ?? null);
}

export async function PATCH(req: Request) {
  const { userId, speakingAutoplay } = await req.json();
  if (!userId) return Response.json({ error: "Missing userId" }, { status: 400 });
  if (typeof speakingAutoplay === "boolean") {
    await updateSpeakingAutoplay(userId, speakingAutoplay);
  }
  return Response.json({ ok: true });
}
