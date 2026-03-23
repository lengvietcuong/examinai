import { setConversationShareId } from "@/lib/db/queries";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const shareId = await setConversationShareId(id);
  return Response.json({ shareId });
}
