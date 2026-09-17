import {
  createConversation,
  getUserConversations,
  deleteConversation,
  updateConversationTitle,
  upsertProfile,
  getConversation,
} from "@/lib/db/queries";
import { getAuthUser } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { userId, type, title } = await req.json();
  const authUser = await getAuthUser(req);

  // If a userId is requested, verify caller is authenticated as that user
  if (userId && (!authUser || authUser.id !== userId)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignedUserId = authUser ? authUser.id : null;

  if (assignedUserId) {
    await upsertProfile({ id: assignedUserId });
  }

  const conversation = await createConversation({
    userId: assignedUserId || undefined,
    type,
    title,
  });
  return Response.json(conversation);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ conversations: [] });

  const authUser = await getAuthUser(req);
  if (!authUser || authUser.id !== userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await getUserConversations(userId);
  return Response.json({ conversations });
}

export async function PATCH(req: Request) {
  const { id, title } = await req.json();
  if (!id || typeof title !== "string") {
    return Response.json({ error: "Missing id or title" }, { status: 400 });
  }

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

  await updateConversationTitle(id, title.trim());
  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

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

  await deleteConversation(id);
  return Response.json({ success: true });
}
