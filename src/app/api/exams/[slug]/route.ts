import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Exam } from "@/models/Exam";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await connectDB();

    const exam = await Exam.findOne({ slug, isPublished: true })
      .populate({
        path: "sections.questions",
        select: "questionType skill difficulty content.question content.choices content.audioUrl content.imageUrl content.passage part",
      })
      .lean();

    if (!exam) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đề thi" }, { status: 404 });
    }

    // Increment view counter (fire-and-forget)
    Exam.updateOne({ slug }, { $inc: { attemptCount: 1 } }).exec();

    return NextResponse.json({ success: true, data: exam });
  } catch {
    return NextResponse.json({ success: false, error: "Không tải được đề thi" }, { status: 500 });
  }
}
