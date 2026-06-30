import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { Exam } from "@/models/Exam";
import { Question } from "@/models/Question";
import { ExamAttempt } from "@/models/UserProgress";
import Link from "next/link";

export const metadata = { title: "Admin — Tổng quan" };

export default async function AdminPage() {
  const session = await auth();
  const adminName = session?.user?.name?.split(" ")[0] ?? "Admin";

  await connectDB();

  const [totalUsers, warnedUsers, bannedUsers, totalExams, totalQuestions, totalAttempts, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "warned" }),
      User.countDocuments({ status: "banned" }),
      Exam.countDocuments({ isPublished: true }),
      Question.countDocuments({ isActive: true }),
      ExamAttempt.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(6).select("name email role status createdAt warnings").lean(),
    ]);

  const stats = [
    { label: "Tổng người dùng", value: totalUsers,     bg: "var(--sky)",      href: "/admin/users" },
    { label: "Đã cảnh cáo",     value: warnedUsers,    bg: "var(--yellow)",   href: "/admin/users?status=warned" },
    { label: "Đã khóa",         value: bannedUsers,    bg: "var(--peach)",    href: "/admin/users?status=banned" },
    { label: "Đề thi public",   value: totalExams,     bg: "var(--mint)",     href: "/admin/content" },
    { label: "Câu hỏi",         value: totalQuestions, bg: "var(--lavender)", href: "/admin/questions" },
    { label: "Lượt thi",        value: totalAttempts,  bg: "var(--ground-2)", href: "/admin/users" },
  ];

  return (
    <div>
      <h1 style={h1}>Chào {adminName} 👋</h1>
      <p style={lead}>Bảng điều khiển quản trị LangMaster.</p>

      {/* Stats */}
      <div style={statsGrid}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ ...statCard, background: s.bg }}>
            <div style={statVal}>{s.value.toLocaleString()}</div>
            <div style={statLbl}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      <div style={section}>
        <div style={sectionHeader}>
          <h2 style={h2}>Người dùng mới nhất</h2>
          <Link href="/admin/users" style={seeAll}>Xem tất cả →</Link>
        </div>
        <div style={table}>
          <div style={thead}>
            <div style={th}>Tên</div>
            <div style={th}>Email</div>
            <div style={th}>Role</div>
            <div style={th}>Trạng thái</div>
            <div style={th}>Ngày đăng ký</div>
          </div>
          {recentUsers.map((u) => (
            <div key={String(u._id)} style={trow}>
              <div style={td}>{u.name}</div>
              <div style={{ ...td, color: "var(--text-dim)", fontSize: ".8125rem" }}>{u.email}</div>
              <div style={td}>
                <span style={u.role === "admin" ? roleAdmin : roleUser}>
                  {u.role}
                </span>
              </div>
              <div style={td}>
                <span style={
                  u.status === "banned"  ? statusBanned  :
                  u.status === "warned"  ? statusWarned  :
                  statusActive
                }>
                  {u.status === "banned" ? "Đã khóa" : u.status === "warned" ? "Cảnh cáo" : "Hoạt động"}
                </span>
              </div>
              <div style={{ ...td, color: "var(--text-dim)", fontSize: ".8125rem" }}>
                {new Date(u.createdAt as Date).toLocaleDateString("vi-VN")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={actionsGrid}>
        <Link href="/admin/content" style={actionCard}>
          <span style={actionIcon}>📝</span>
          <div style={actionTitle}>Thêm đề thi</div>
          <div style={actionDesc}>Tạo đề thi mới hoặc import câu hỏi</div>
        </Link>
        <Link href="/admin/questions" style={actionCard}>
          <span style={actionIcon}>❓</span>
          <div style={actionTitle}>Quản lý câu hỏi</div>
          <div style={actionDesc}>Thêm, sửa, xóa câu hỏi trong kho đề</div>
        </Link>
        <Link href="/admin/users" style={actionCard}>
          <span style={actionIcon}>👥</span>
          <div style={actionTitle}>Quản lý người dùng</div>
          <div style={actionDesc}>Cảnh cáo, khóa hoặc đổi quyền tài khoản</div>
        </Link>
      </div>
    </div>
  );
}

// ── Styles ──

const h1: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800, fontSize: "1.875rem",
  letterSpacing: "-.02em", color: "var(--text)", marginBottom: ".25rem",
};
const lead: React.CSSProperties = { fontSize: "1rem", color: "var(--text-mid)", marginBottom: "2rem" };
const statsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2.5rem" };
const statCard: React.CSSProperties = { borderRadius: "16px", padding: "1.25rem 1.5rem", textDecoration: "none", display: "block" };
const statVal: React.CSSProperties = { fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.875rem", color: "var(--text)", marginBottom: ".2rem" };
const statLbl: React.CSSProperties = { fontSize: ".8rem", color: "var(--text-mid)" };
const section: React.CSSProperties = { background: "#fff", borderRadius: "20px", padding: "1.5rem", border: "1.5px solid var(--ground-2)", marginBottom: "1.5rem" };
const sectionHeader: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" };
const h2: React.CSSProperties = { fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.125rem", color: "var(--text)" };
const seeAll: React.CSSProperties = { fontSize: ".875rem", color: "var(--accent)", fontWeight: 600, textDecoration: "none" };
const table: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0" };
const thead: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr", gap: "1rem", padding: ".5rem 0 .75rem", borderBottom: "1.5px solid var(--ground-2)", marginBottom: ".25rem" };
const th: React.CSSProperties = { fontSize: ".75rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".06em" };
const trow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.5fr 2fr 1fr 1fr 1fr", gap: "1rem", padding: ".75rem 0", borderBottom: "1px solid var(--ground-2)", alignItems: "center" };
const td: React.CSSProperties = { fontSize: ".9rem", color: "var(--text)" };

const badgeBase: React.CSSProperties = { display: "inline-block", padding: ".2rem .65rem", borderRadius: "999px", fontSize: ".75rem", fontWeight: 600 };
const roleAdmin: React.CSSProperties = { ...badgeBase, background: "var(--peach)", color: "#7a3010" };
const roleUser: React.CSSProperties = { ...badgeBase, background: "var(--ground-2)", color: "var(--text-dim)" };
const statusActive: React.CSSProperties = { ...badgeBase, background: "var(--mint)", color: "#0f5c44" };
const statusWarned: React.CSSProperties = { ...badgeBase, background: "var(--yellow)", color: "#5a4a00" };
const statusBanned: React.CSSProperties = { ...badgeBase, background: "#fee2e2", color: "#991b1b" };

const actionsGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" };
const actionCard: React.CSSProperties = { background: "#fff", borderRadius: "16px", padding: "1.5rem", border: "1.5px solid var(--ground-2)", textDecoration: "none", display: "block", transition: "transform .18s" };
const actionIcon: React.CSSProperties = { fontSize: "1.75rem", display: "block", marginBottom: ".75rem" };
const actionTitle: React.CSSProperties = { fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: ".375rem" };
const actionDesc: React.CSSProperties = { fontSize: ".8375rem", color: "var(--text-dim)", lineHeight: 1.55 };
