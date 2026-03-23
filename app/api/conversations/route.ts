import {
  createConversation,
  getUserConversations,
  deleteConversation,
  updateConversationTitle,
  upsertProfile,
} from "@/lib/db/queries";

export async function POST(req: Request) {
  const { userId, type, title } = await req.json();

  // Ensure the user's profile exists before creating a conversation
  if (userId) {
    await upsertProfile({ id: userId });
  }

  const conversation = await createConversation({ userId, type, title });
  return Response.json(conversation);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return Response.json({ conversations: [] });
  const conversations = await getUserConversations(userId);
  return Response.json({ conversations });
}

export async function PATCH(req: Request) {
  const { id, title } = await req.json();
  if (!id || typeof title !== "string") {
    return Response.json({ error: "Missing id or title" }, { status: 400 });
  }
  await updateConversationTitle(id, title.trim());
  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await deleteConversation(id);
  return Response.json({ success: true });
}
