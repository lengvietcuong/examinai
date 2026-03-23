import { getMessages, addMessage } from "@/lib/db/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const msgs = await getMessages(id);
  return Response.json({ messages: msgs });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { role, content } = await req.json();
  const message = await addMessage({ conversationId: id, role, content });
  return Response.json(message);
}
