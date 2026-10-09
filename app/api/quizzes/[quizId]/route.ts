import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { quizQuestions, quizzes } from "@/lib/db/schema";
import { handleApiError, isUuid, jsonError, requireUser } from "@/lib/api";

export const runtime = "nodejs";

type Context = { params: Promise<{ quizId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { quizId } = await params;
    if (!isUuid(quizId)) return jsonError("Invalid quiz ID.", 400);
    const [quiz] = await getDb()
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)))
      .limit(1);
    if (!quiz) return jsonError("Quiz not found.", 404);
    const questions = await getDb()
      .select({
        id: quizQuestions.id,
        prompt: quizQuestions.prompt,
        choices: quizQuestions.choices,
        position: quizQuestions.position,
      })
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.position));
    return Response.json({ data: { ...quiz, questions } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { quizId } = await params;
    if (!isUuid(quizId)) return jsonError("Invalid quiz ID.", 400);
    const [quiz] = await getDb()
      .delete(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)))
      .returning({ id: quizzes.id });
    return quiz ? Response.json({ data: quiz }) : jsonError("Quiz not found.", 404);
  } catch (error) {
    return handleApiError(error);
  }
}
