import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("warn"),
    reason: z.string().min(5, "Lý do cần ít nhất 5 ký tự"),
  }),
  z.object({
    action: z.literal("ban"),
    reason: z.string().min(5, "Lý do cần ít nhất 5 ký tự"),
  }),
  z.object({
    action: z.literal("unban"),
  }),
  z.object({
    action: z.literal("set_role"),
    role: z.enum(["user", "moderator", "admin"]),
  }),
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const actor = session?.user as { id?: string; role?: string } | undefined;
  if (actor?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = ActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  await connectDB();

  const target = await User.findById(id);
  if (!target) {
    return NextResponse.json({ success: false, error: "Không tìm thấy người dùng" }, { status: 404 });
  }

  // Prevent acting on another admin
  if (target.role === "admin" && actor.id !== id) {
    return NextResponse.json({ success: false, error: "Không thể thay đổi tài khoản admin khác" }, { status: 403 });
  }

  const { action } = parsed.data;

  if (action === "warn") {
    target.warnings.push({
      reason: parsed.data.reason,
      issuedBy: actor.id as unknown as import("mongoose").Types.ObjectId,
      issuedAt: new Date(),
    });
    target.status = "warned";
  } else if (action === "ban") {
    target.status = "banned";
    target.banReason = parsed.data.reason;
    target.bannedAt = new Date();
  } else if (action === "unban") {
    target.status = "active";
    target.banReason = undefined;
    target.bannedAt = undefined;
  } else if (action === "set_role") {
    target.role = parsed.data.role;
  }

  await target.save();

  return NextResponse.json({
    success: true,
    data: {
      id:       target._id.toString(),
      name:     target.name,
      status:   target.status,
      role:     target.role,
      warnings: target.warnings.length,
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const actor = session?.user as { role?: string } | undefined;
  if (actor?.role !== "admin") {
    return NextResponse.json({ success: false, error: "Không có quyền" }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  const user = await User.findById(id)
    .select("name email role status warnings banReason bannedAt createdAt streakDays currentGoal")
    .lean();

  if (!user) {
    return NextResponse.json({ success: false, error: "Không tìm thấy người dùng" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}
