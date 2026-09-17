import { getConversation, setConversationShareId } from "@/lib/db/queries";
import { getAuthUser } from "@/lib/supabase/server";

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

  const shareId = await setConversationShareId(id);
  return Response.json({ shareId });
}
