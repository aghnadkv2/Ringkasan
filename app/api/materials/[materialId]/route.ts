import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { handleApiError, isUuid, jsonError, requireUser, readJson } from "@/lib/api";
import { materialUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Context = { params: Promise<{ materialId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { materialId } = await params;
    if (!isUuid(materialId)) return jsonError("Invalid material ID.", 400);
    const input = await readJson(request, materialUpdateSchema);
    const [material] = await getDb()
      .update(materials)
      .set(input)
      .where(and(eq(materials.id, materialId), eq(materials.userId, user.id)))
      .returning();

    return material
      ? Response.json({ data: material })
      : jsonError("Material not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { materialId } = await params;
    if (!isUuid(materialId)) return jsonError("Invalid material ID.", 400);
    const [material] = await getDb()
      .delete(materials)
      .where(and(eq(materials.id, materialId), eq(materials.userId, user.id)))
      .returning({ id: materials.id });

    return material ? Response.json({ data: material }) : jsonError("Material not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}
