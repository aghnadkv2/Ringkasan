import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { quizAttempts, quizQuestions, quizzes } from "@/lib/db/schema";
import { handleApiError, isUuid, jsonError, requireUser, readJson } from "@/lib/api";
import { quizAnswersSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Context = { params: Promise<{ quizId: string }> };

export async function GET(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { quizId } = await params;
    if (!isUuid(quizId)) return jsonError("Invalid quiz ID.", 400);
    const [quiz] = await getDb()
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)))
      .limit(1);
    if (!quiz) return jsonError("Quiz not found.", 404);
    const rows = await getDb().query.quizAttempts.findMany({
      where: and(eq(quizAttempts.quizId, quizId), eq(quizAttempts.userId, user.id)),
      orderBy: [desc(quizAttempts.completedAt)],
    });
    return Response.json({ data: rows });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const { quizId } = await params;
    if (!isUuid(quizId)) return jsonError("Invalid quiz ID.", 400);
    const { answers } = await readJson(request, quizAnswersSchema);
    const [quiz] = await getDb()
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, user.id)))
      .limit(1);
    if (!quiz) return jsonError("Quiz not found.", 404);

    const questions = await getDb()
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.position));
    if (questions.length === 0) return jsonError("This quiz has no questions.", 400);

    const questionIds = new Set(questions.map((question) => question.id));
    for (const [questionId, selectedAnswer] of Object.entries(answers)) {
      const question = questions.find((item) => item.id === questionId);
      if (!question || !questionIds.has(questionId) || selectedAnswer >= question.choices.length) {
        return jsonError("An answer references an invalid question or choice.", 400);
      }
    }
    const correctCount = questions.reduce(
      (count, question) => count + (answers[question.id] === question.correctAnswer ? 1 : 0),
      0,
    );
    const score = Math.round((correctCount / questions.length) * 100);
    const [attempt] = await getDb()
      .insert(quizAttempts)
      .values({
        quizId,
        userId: user.id,
        answers,
        questionCount: questions.length,
        correctCount,
        score,
      })
      .returning();

    return Response.json(
      {
        data: {
          ...attempt,
          review: questions.map((question) => ({
            questionId: question.id,
            correctAnswer: question.correctAnswer,
            selectedAnswer: answers[question.id] ?? null,
            isCorrect: answers[question.id] === question.correctAnswer,
            explanation: question.explanation,
          })),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
