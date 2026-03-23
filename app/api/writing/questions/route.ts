import { getRandomWritingQuestions } from "@/lib/db/queries";

export async function POST(req: Request) {
  const { taskNumbers } = await req.json();
  const raw = await getRandomWritingQuestions(taskNumbers);
  const questions = raw.map((q) => ({
    id: q.id,
    title: q.testTitle,
    content: q.content,
    imageUrl: q.imageUrl,
    taskNumber: q.taskNumber,
  }));
  return Response.json({ questions });
}
