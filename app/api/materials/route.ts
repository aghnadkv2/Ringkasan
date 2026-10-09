import { desc, ilike, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { materials } from "@/lib/db/schema";
import { handleApiError, jsonError, requireUser, readJson } from "@/lib/api";
import { materialCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);

    const search = new URL(request.url).searchParams.get("search")?.trim();
    const conditions = search
      ? or(ilike(materials.title, `%${search}%`), ilike(materials.subject, `%${search}%`))
      : undefined;
    const rows = await getDb().query.materials.findMany({
      where: (table, { and, eq }) =>
        conditions ? and(eq(table.userId, user.id), conditions) : eq(table.userId, user.id),
      orderBy: [desc(materials.createdAt)],
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
    const input = await readJson(request, materialCreateSchema);
    const [material] = await getDb()
      .insert(materials)
      .values({
        userId: user.id,
        title: input.title,
        subject: input.subject,
        category: input.category,
        sourceType: input.sourceType,
        sourceUrl: input.sourceUrl,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
      })
      .returning();

    return Response.json({ data: material }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
