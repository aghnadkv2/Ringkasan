import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { handleApiError, isUuid, jsonError, requireUser, readJson } from "@/lib/api";
import { noteUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Context = { params: Promise<{ noteId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { noteId } = await params;
    if (!isUuid(noteId)) return jsonError("Invalid note ID.", 400);
    const [note] = await getDb()
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)))
      .limit(1);
    return note ? Response.json({ data: note }) : jsonError("Note not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { noteId } = await params;
    if (!isUuid(noteId)) return jsonError("Invalid note ID.", 400);
    const input = await readJson(request, noteUpdateSchema);
    const sourceMaterialIds = input.sourceMaterialIds ?? [];
    if (sourceMaterialIds.length > 0) {
      const ownedMaterials = await getDb().query.materials.findMany({
        columns: { id: true },
        where: (table, { and, eq, inArray }) =>
          and(eq(table.userId, user.id), inArray(table.id, sourceMaterialIds)),
      });
      if (ownedMaterials.length !== new Set(sourceMaterialIds).size) {
        return jsonError("One or more source materials were not found.", 400);
      }
    }
    const [note] = await getDb()
      .update(notes)
      .set(input)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)))
      .returning();
    return note ? Response.json({ data: note }) : jsonError("Note not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { noteId } = await params;
    if (!isUuid(noteId)) return jsonError("Invalid note ID.", 400);
    const [note] = await getDb()
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, user.id)))
      .returning({ id: notes.id });
    return note ? Response.json({ data: note }) : jsonError("Note not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}
