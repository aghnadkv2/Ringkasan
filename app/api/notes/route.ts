import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { handleApiError, jsonError, requireUser, readJson } from "@/lib/api";
import { noteCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const rows = await getDb().query.notes.findMany({
      where: eq(notes.userId, user.id),
      orderBy: [desc(notes.updatedAt)],
    });
    return Response.json({ data: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const input = await readJson(request, noteCreateSchema);
    if (input.sourceMaterialIds.length) {
      const ownedMaterials = await getDb().query.materials.findMany({
        columns: { id: true },
        where: (table, { and, eq, inArray }) =>
          and(eq(table.userId, user.id), inArray(table.id, input.sourceMaterialIds)),
      });
      if (ownedMaterials.length !== new Set(input.sourceMaterialIds).size) {
        return jsonError("One or more source materials were not found.", 400);
      }
    }
    const [note] = await getDb()
      .insert(notes)
      .values({ ...input, userId: user.id })
      .returning();
    return Response.json({ data: note }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
