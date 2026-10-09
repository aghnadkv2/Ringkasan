import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { handleApiError, jsonError, requireUser, readJson } from "@/lib/api";
import { preferencesUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const [preferences] = await getDb()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id))
      .limit(1);
    return Response.json({
      data: preferences ?? {
        userId: user.id,
        theme: "light",
        notificationsEnabled: true,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const input = await readJson(request, preferencesUpdateSchema);
    const [preferences] = await getDb()
      .insert(userPreferences)
      .values({ userId: user.id, ...input })
      .onConflictDoUpdate({
        target: userPreferences.userId,
        set: { ...input, updatedAt: new Date() },
      })
      .returning();
    return Response.json({ data: preferences });
  } catch (error) {
    return handleApiError(error);
  }
}
