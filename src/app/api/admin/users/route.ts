import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  const session = await auth();
  const actor = session?.user as { role?: string } | undefined;
  if (actor?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page   = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit  = Math.min(50, Number(searchParams.get("limit") ?? 20));

  await connectDB();

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) filter.$or = [
    { name:  { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("name email role status warnings bannedAt createdAt streakDays")
      .lean(),
    User.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    data: users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
