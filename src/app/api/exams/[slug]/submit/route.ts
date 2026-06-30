import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/models/Exam";
import { Question } from "@/models/Question";
import { ExamAttempt } from "@/models/UserProgress";
import type { Types } from "mongoose";

const SubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      userAnswer: z.string(),
      timeSpentSeconds: z.number().optional().default(0),
    })
  ),
  timeTakenSeconds: z.number().min(0),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await req.json();
    const parsed = SubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { answers, timeTakenSeconds } = parsed.data;

    await connectDB();

    const exam = await Exam.findOne({ slug, isPublished: true }).lean();
    if (!exam) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đề thi" }, { status: 404 });
    }

    // Fetch correct answers for all submitted questions
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } })
      .select("answer.correct")
      .lean();

    const correctMap = new Map(
      questions.map(q => [(q._id as Types.ObjectId).toString(), q.answer.correct])
    );

    // Score each answer
    const scoredAnswers = answers.map(a => ({
      questionId: a.questionId,
      userAnswer: a.userAnswer,
      isCorrect: correctMap.get(a.questionId) === a.userAnswer,
      timeSpentSeconds: a.timeSpentSeconds,
    }));

    const correctCount = scoredAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = exam.totalQuestions || answers.length;

    // Scale score to exam's maxScore (e.g. 990 for TOEIC)
    const score = Math.round((correctCount / totalQuestions) * exam.maxScore);

    // Build per-section scores
    const sectionScores = exam.sections.map(section => {
      const sectionQIds = new Set(section.questions.map((q: Types.ObjectId) => q.toString()));
      const sectionAnswers = scoredAnswers.filter(a => sectionQIds.has(a.questionId));
      return {
        sectionName: section.name,
        score: sectionAnswers.filter(a => a.isCorrect).length,
        total: sectionAnswers.length,
      };
    });

    const attempt = await ExamAttempt.create({
      userId: session.user.id,
      examId: exam._id,
      answers: scoredAnswers,
      score,
      sectionScores,
      timeTakenSeconds,
      completedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt._id.toString(),
        score,
        maxScore: exam.maxScore,
        correctCount,
        totalQuestions,
        sectionScores,
        timeTakenSeconds,
        answers: scoredAnswers,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Nộp bài thất bại, thử lại" }, { status: 500 });
  }
}
