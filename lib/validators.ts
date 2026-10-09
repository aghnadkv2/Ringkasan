import { z } from "zod";

const uuid = z.string().uuid();
const title = z.string().trim().min(1).max(200);

export const materialCreateSchema = z
  .object({
    title,
    subject: z.string().trim().min(1).max(100).optional(),
    category: z.enum(["Kuliah / Sekolah", "Ujian Masuk / UTBK", "Belajar Mandiri"]).default("Belajar Mandiri"),
    sourceType: z.enum(["file", "url"]),
    sourceUrl: z.string().url().max(2048).optional(),
    fileName: z.string().trim().min(1).max(255).optional(),
    mimeType: z.string().trim().min(1).max(150).optional(),
    sizeBytes: z.number().int().positive().max(25 * 1024 * 1024).optional(),
  })
  .refine(
    (value) =>
      (value.sourceType === "url" && Boolean(value.sourceUrl)) ||
      (value.sourceType === "file" && Boolean(value.fileName)),
    { message: "Provide a URL or file metadata matching sourceType." },
  );

export const materialUpdateSchema = z
  .object({
    title: title.optional(),
    subject: z.string().trim().min(1).max(100).optional(),
    category: z.enum(["Kuliah / Sekolah", "Ujian Masuk / UTBK", "Belajar Mandiri"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

export const noteCreateSchema = z.object({
  title,
  content: z.string().max(100_000).default(""),
  subject: z.string().trim().min(1).max(100).default("Belajar Mandiri"),
  sourceMaterialIds: z.array(uuid).max(50).default([]),
});

export const noteUpdateSchema = z
  .object({
    title: title.optional(),
    content: z.string().max(100_000).optional(),
    subject: z.string().trim().min(1).max(100).optional(),
    sourceMaterialIds: z.array(uuid).max(50).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

function validDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export const scheduleCreateSchema = z.object({
  subject: z.string().trim().min(1).max(100),
  title,
  scheduledAt: z.string().refine(validDate, "scheduledAt must be a valid date."),
  durationMinutes: z.number().int().min(5).max(1440),
  reminderMinutes: z.number().int().min(0).max(10080).default(15),
});

export const scheduleUpdateSchema = z
  .object({
    subject: z.string().trim().min(1).max(100).optional(),
    title: title.optional(),
    scheduledAt: z.string().refine(validDate, "scheduledAt must be a valid date.").optional(),
    durationMinutes: z.number().int().min(5).max(1440).optional(),
    reminderMinutes: z.number().int().min(0).max(10080).optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");

const questionSchema = z
  .object({
    prompt: z.string().trim().min(1).max(5000),
    choices: z.array(z.string().trim().min(1).max(1000)).min(2).max(10),
    correctAnswer: z.number().int().min(0),
    explanation: z.string().max(5000).optional(),
  })
  .refine((value) => value.correctAnswer < value.choices.length, {
    message: "correctAnswer must point to an existing choice.",
  });

export const quizCreateSchema = z.object({
  title,
  materialId: uuid.optional(),
  questions: z.array(questionSchema).min(1).max(100),
});

export const aiSummarySchema = z.object({
  content: z.string().trim().min(30).max(60_000),
});

export const aiQuizSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(50).max(60_000),
  questionCount: z.number().int().min(3).max(20).default(5),
});

export const quizAnswersSchema = z.object({
  answers: z.record(uuid, z.number().int().nonnegative()),
});

export const preferencesUpdateSchema = z
  .object({
    theme: z.enum(["light", "dark"]).optional(),
    notificationsEnabled: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "At least one field is required.");
