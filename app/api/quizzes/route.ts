import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { materials, quizQuestions, quizzes } from "@/lib/db/schema";
import { handleApiError, jsonError, requireUser, readJson } from "@/lib/api";
import { quizCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    if (!user) return jsonError("Authentication required.", 401);
    const rows = await getDb().query.quizzes.findMany({
      where: eq(quizzes.userId, user.id),
      with: { questions: { columns: { id: true, prompt: true, choices: true, position: true } } },
      orderBy: [desc(quizzes.createdAt)],
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
    const input = await readJson(request, quizCreateSchema);
    const db = getDb();

    const quiz = await db.transaction(async (tx) => {
      if (input.materialId) {
        const [ownedMaterial] = await tx
          .select({ id: materials.id })
          .from(materials)
          .where(and(eq(materials.id, input.materialId), eq(materials.userId, user.id)))
          .limit(1);
        if (!ownedMaterial) throw new Error("Source material not found.");
      }
      const [createdQuiz] = await tx
        .insert(quizzes)
        .values({ title: input.title, materialId: input.materialId, userId: user.id })
        .returning();
      const questions = await tx
        .insert(quizQuestions)
        .values(
          input.questions.map((question, position) => ({
            quizId: createdQuiz.id,
            prompt: question.prompt,
            choices: question.choices,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            position,
          })),
        )
        .returning({
          id: quizQuestions.id,
          prompt: quizQuestions.prompt,
          choices: quizQuestions.choices,
          position: quizQuestions.position,
        });
      return { ...createdQuiz, questions };
    });

    return Response.json({ data: quiz }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Source material not found.") {
      return jsonError(error.message, 400);
    }
    return handleApiError(error);
  }
}
