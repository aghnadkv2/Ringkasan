import { and, asc, eq, gte, lt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { studySessions } from "@/lib/db/schema";
import { handleApiError, jsonError, requireUser, readJson } from "@/lib/api";
import { scheduleCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const params = new URL(request.url).searchParams;
    const from = params.get("from");
    const to = params.get("to");
    const dateFilters = [];
    if (from) {
      const start = new Date(from);
      if (Number.isNaN(start.getTime())) return jsonError("The from date is invalid.", 400);
      dateFilters.push(gte(studySessions.scheduledAt, start));
    }
    if (to) {
      const end = new Date(to);
      if (Number.isNaN(end.getTime())) return jsonError("The to date is invalid.", 400);
      dateFilters.push(lt(studySessions.scheduledAt, end));
    }
    if (from && to && new Date(from) >= new Date(to)) {
      return jsonError("The from date must be earlier than the to date.", 400);
    }
    const rows = await getDb().query.studySessions.findMany({
      where: and(eq(studySessions.userId, user.id), ...dateFilters),
      orderBy: [asc(studySessions.scheduledAt)],
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
    const input = await readJson(request, scheduleCreateSchema);
    const [studySession] = await getDb()
      .insert(studySessions)
      .values({
        ...input,
        scheduledAt: new Date(input.scheduledAt),
        userId: user.id,
      })
      .returning();
    return Response.json({ data: studySession }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
