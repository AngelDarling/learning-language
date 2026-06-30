import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Exam } from "@/models/Exam";
import { Question } from "@/models/Question";
import { ExamAttempt } from "@/models/UserProgress";

export async function GET() {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;
  if (user?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền truy cập" }, { status: 403 });
  }

  await connectDB();

  const [totalUsers, bannedUsers, totalExams, totalQuestions, totalAttempts, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "banned" }),
      Exam.countDocuments({ isPublished: true }),
      Question.countDocuments({ isActive: true }),
      ExamAttempt.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role status createdAt")
        .lean(),
    ]);

  return NextResponse.json({
    success: true,
    data: {
      totalUsers,
      bannedUsers,
      totalExams,
      totalQuestions,
      totalAttempts,
      recentUsers,
    },
  });
}
