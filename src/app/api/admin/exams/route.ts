import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/models/Exam";
import { Language } from "@/models/Language";

const ExamSchema = z.object({
  examType:         z.enum(["TOEIC", "IELTS", "TOEFL", "VOCABULARY", "GRAMMAR"]),
  title:            z.string().min(3),
  slug:             z.string().min(3).regex(/^[a-z0-9-]+$/, "Slug chỉ gồm chữ thường, số và dấu -"),
  description:      z.string().optional(),
  timeLimitSeconds: z.number().min(60),
  maxScore:         z.number().min(1),
  isPremium:        z.boolean().default(false),
  isPublished:      z.boolean().default(false),
  languageCode:     z.string().default("en"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  const actor = session?.user as { role?: string } | undefined;
  if (actor?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ExamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0].message }, { status: 400 });
  }

  await connectDB();

  const { languageCode, ...examData } = parsed.data;

  let language = await Language.findOne({ code: languageCode });
  if (!language) {
    language = await Language.create({
      code: "en", name: "English", nativeName: "Tiếng Anh", flag: "🇬🇧",
    });
  }

  const existing = await Exam.findOne({ slug: examData.slug });
  if (existing) {
    return NextResponse.json({ success: false, error: "Slug này đã được sử dụng" }, { status: 409 });
  }

  const exam = await Exam.create({
    ...examData,
    languageId: language._id,
    sections: [],
    totalQuestions: 0,
  });

  return NextResponse.json({ success: true, data: exam }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const actor = session?.user as { role?: string } | undefined;
  if (actor?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page  = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 20;

  await connectDB();

  const [exams, total] = await Promise.all([
    Exam.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title slug examType totalQuestions timeLimitSeconds isPremium isPublished maxScore attemptCount createdAt")
      .lean(),
    Exam.countDocuments(),
  ]);

  return NextResponse.json({ success: true, data: exams, total, page, totalPages: Math.ceil(total / limit) });
}
