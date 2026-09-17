import { getMessages, addMessage, getConversation } from "@/lib/db/queries";
import { getAuthUser } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  // Publicly shared conversations can be read by anyone
  if (!conv.shareId && conv.userId) {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.id !== conv.userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const msgs = await getMessages(id);
  return Response.json({ messages: msgs });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const conv = await getConversation(id);
  if (!conv) {
    return Response.json({ error: "Conversation not found" }, { status: 404 });
  }

  if (conv.userId) {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.id !== conv.userId) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { role, content } = await req.json();
  const message = await addMessage({ conversationId: id, role, content });
  return Response.json(message);
}
