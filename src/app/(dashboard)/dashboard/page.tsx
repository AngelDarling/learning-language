import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = { title: "Tổng quan" };

const paths = [
  { name: "TOEIC",     desc: "Luyện Part 1–7, thi thử, phân tích điểm yếu",        bg: "var(--mint)",     href: "/dashboard/exam?type=TOEIC" },
  { name: "IELTS",     desc: "Listening, Reading, Writing, Speaking",                bg: "var(--peach)",    href: "/dashboard/exam?type=IELTS" },
  { name: "TOEFL",     desc: "Luyện kỹ năng học thuật chuẩn iBT",                  bg: "var(--lavender)", href: "/dashboard/exam?type=TOEFL" },
  { name: "Từ vựng",   desc: "8,000 flashcard spaced repetition theo chủ đề thi",   bg: "var(--sky)",      href: "/dashboard/vocabulary" },
];

const stats = [
  { label: "Streak",       value: "0 ngày", bg: "var(--yellow)" },
  { label: "Câu đã làm",   value: "0",      bg: "var(--mint)" },
  { label: "Từ đã học",    value: "0",      bg: "var(--sky)" },
  { label: "Đề đã thi",    value: "0",      bg: "var(--peach)" },
];

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "bạn";

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={h1}>Chào {firstName}! 👋</h1>
        <p style={sub}>Hôm nay bạn học gì?</p>
      </div>

      {/* Stats */}
      <div style={statsGrid}>
        {stats.map(s => (
          <div key={s.label} style={{ ...statCard, background: s.bg }}>
            <div style={statVal}>{s.value}</div>
            <div style={statLbl}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Path cards */}
      <h2 style={sectionH2}>Chọn lộ trình</h2>
      <div style={pathsGrid}>
        {paths.map(p => (
          <Link key={p.name} href={p.href} style={{ ...pathCard, background: p.bg }}>
            <div style={pathName}>{p.name}</div>
            <div style={pathDesc}>{p.desc}</div>
            <div style={pathCta}>Vào học →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const h1: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.875rem",
  letterSpacing: "-.02em",
  color: "var(--text)",
  marginBottom: ".25rem",
};

const sub: React.CSSProperties = {
  fontSize: "1rem",
  color: "var(--text-mid)",
};

const statsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "1rem",
  marginBottom: "2.5rem",
};

const statCard: React.CSSProperties = {
  borderRadius: "16px",
  padding: "1.25rem 1.5rem",
};

const statVal: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.5rem",
  color: "var(--text)",
  marginBottom: ".2rem",
};

const statLbl: React.CSSProperties = {
  fontSize: ".8rem",
  color: "var(--text-mid)",
};

const sectionH2: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.2rem",
  letterSpacing: "-.01em",
  color: "var(--text)",
  marginBottom: "1.25rem",
};

const pathsGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "1rem",
};

const pathCard: React.CSSProperties = {
  borderRadius: "20px",
  padding: "1.75rem",
  textDecoration: "none",
  display: "block",
};

const pathName: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.375rem",
  color: "var(--text)",
  letterSpacing: "-.02em",
  marginBottom: ".375rem",
};

const pathDesc: React.CSSProperties = {
  fontSize: ".875rem",
  color: "var(--text-mid)",
  lineHeight: 1.6,
  marginBottom: "1.25rem",
};

const pathCta: React.CSSProperties = {
  fontSize: ".875rem",
  fontWeight: 700,
  color: "var(--text-mid)",
};
