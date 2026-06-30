import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Question } from "@/models/Question";
import { Language } from "@/models/Language";

const ChoiceSchema = z.object({
  key:  z.string().length(1),
  text: z.string().min(1),
});

const QuestionSchema = z.object({
  examType:     z.string().min(1),
  part:         z.number().optional(),
  questionType: z.enum(["multiple_choice", "fill_in_blank", "listening_choice", "matching", "true_false_ng", "short_answer"]),
  skill:        z.enum(["listening", "reading", "grammar", "vocabulary", "writing", "speaking"]),
  difficulty:   z.number().min(1).max(5),
  content: z.object({
    passage:    z.string().optional(),
    audioUrl:   z.string().optional(),
    imageUrl:   z.string().optional(),
    question:   z.string().min(1),
    choices:    z.array(ChoiceSchema).optional(),
    blankIndex: z.number().optional(),
  }),
  answer: z.object({
    correct:       z.string().min(1),
    explanation:   z.string().min(1),
    explanationEn: z.string().optional(),
    grammarPoint:  z.string().optional(),
  }),
  tags:         z.array(z.string()).default([]),
  languageCode: z.string().default("en"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const actor = session?.user as { role?: string } | undefined;
  if (actor?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = QuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();
  const { languageCode, ...qData } = parsed.data;

  let language = await Language.findOne({ code: languageCode });
  if (!language) {
    language = await Language.create({ code: "en", name: "English", nativeName: "Tiếng Anh", flag: "🇬🇧" });
  }

  const question = await Question.create({
    ...qData,
    difficulty: qData.difficulty as 1 | 2 | 3 | 4 | 5,
    languageId: language._id,
  });

  return NextResponse.json({ success: true, data: { id: (question as { _id: { toString(): string } })._id.toString() } }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const actor = session?.user as { role?: string } | undefined;
  if (actor?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const examType = searchParams.get("examType");
  const skill    = searchParams.get("skill");
  const page     = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit    = 20;

  await connectDB();

  const filter: Record<string, unknown> = { isActive: true };
  if (examType) filter.examType = examType;
  if (skill)    filter.skill = skill;

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("examType part skill difficulty questionType content.question answer.correct tags createdAt")
      .lean(),
    Question.countDocuments(filter),
  ]);

  return NextResponse.json({ success: true, data: questions, total, page, totalPages: Math.ceil(total / limit) });
}
