import { getRandomSpeakingQuestions } from "@/lib/db/queries";

export async function POST(req: Request) {
  const { partNumbers } = await req.json();
  const raw = await getRandomSpeakingQuestions(partNumbers);
  const questions = raw.map((q) => ({
    partNumber: q.partNumber,
    title: q.testTitle,
    content: q.content,
  }));
  return Response.json({ questions });
}
