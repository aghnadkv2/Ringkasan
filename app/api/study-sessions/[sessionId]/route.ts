import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { studySessions } from "@/lib/db/schema";
import { handleApiError, isUuid, jsonError, requireUser, readJson } from "@/lib/api";
import { scheduleUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Context = { params: Promise<{ sessionId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { sessionId } = await params;
    if (!isUuid(sessionId)) return jsonError("Invalid study session ID.", 400);
    const input = await readJson(request, scheduleUpdateSchema);
    const [studySession] = await getDb()
      .update(studySessions)
      .set({
        ...input,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
      })
      .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, user.id)))
      .returning();
    return studySession
      ? Response.json({ data: studySession })
      : jsonError("Study session not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { sessionId } = await params;
    if (!isUuid(sessionId)) return jsonError("Invalid study session ID.", 400);
    const [studySession] = await getDb()
      .delete(studySessions)
      .where(and(eq(studySessions.id, sessionId), eq(studySessions.userId, user.id)))
      .returning({ id: studySessions.id });
    return studySession
      ? Response.json({ data: studySession })
      : jsonError("Study session not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}
