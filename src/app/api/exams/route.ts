import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/models/Exam";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const examType = searchParams.get("type");
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(20, Number(searchParams.get("limit") ?? 10));

    await connectDB();

    const filter: Record<string, unknown> = { isPublished: true };
    if (examType) filter.examType = examType.toUpperCase();

    const [exams, total] = await Promise.all([
      Exam.find(filter)
        .select("title slug examType totalQuestions timeLimitSeconds isPremium maxScore attemptCount")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Exam.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: exams,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ success: false, error: "Không tải được danh sách đề thi" }, { status: 500 });
  }
}
