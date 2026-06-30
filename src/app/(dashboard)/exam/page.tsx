export const metadata = { title: "Luyện đề" };

const examTypes = [
  { key: "TOEIC",      label: "TOEIC",    bg: "var(--mint)",     desc: "120 đề · Part 1–7" },
  { key: "IELTS",      label: "IELTS",    bg: "var(--peach)",    desc: "60 đề · Full test" },
  { key: "TOEFL",      label: "TOEFL",    bg: "var(--lavender)", desc: "30 đề · iBT format" },
];

export default function ExamListPage() {
  return (
    <div>
      <h1 style={h1}>Luyện đề</h1>
      <p style={lead}>Chọn loại bài thi để bắt đầu.</p>

      {/* Type filter chips */}
      <div style={chips}>
        {["Tất cả", "TOEIC", "IELTS", "TOEFL"].map(t => (
          <a key={t} href={t === "Tất cả" ? "/dashboard/exam" : `/dashboard/exam?type=${t}`}
            style={chip}>
            {t}
          </a>
        ))}
      </div>

      {/* Path cards */}
      <div style={typeGrid}>
        {examTypes.map(e => (
          <a key={e.key} href={`/dashboard/exam?type=${e.key}`} style={{ ...typeCard, background: e.bg }}>
            <div style={typeName}>{e.label}</div>
            <div style={typeDesc}>{e.desc}</div>
            <div style={typeCta}>Xem đề →</div>
          </a>
        ))}
      </div>

      {/* Empty state — sẽ được thay bằng dữ liệu thật từ DB */}
      <div style={emptyArea}>
        <div style={emptyIcon}>📝</div>
        <h2 style={emptyTitle}>Chưa có đề thi nào</h2>
        <p style={emptyDesc}>
          Thêm đề thi qua Admin Panel để bắt đầu luyện tập.
        </p>
        <a href="/admin/content" style={emptyBtn}>Thêm đề thi →</a>
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
  marginBottom: ".375rem",
};

const lead: React.CSSProperties = {
  fontSize: "1rem",
  color: "var(--text-mid)",
  marginBottom: "1.75rem",
};

const chips: React.CSSProperties = {
  display: "flex",
  gap: ".5rem",
  flexWrap: "wrap",
  marginBottom: "2rem",
};

const chip: React.CSSProperties = {
  padding: ".4rem 1rem",
  borderRadius: "999px",
  background: "#fff",
  border: "1.5px solid var(--ground-2)",
  fontSize: ".875rem",
  fontWeight: 500,
  color: "var(--text-mid)",
  textDecoration: "none",
  cursor: "pointer",
};

const typeGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "1rem",
  marginBottom: "2.5rem",
};

const typeCard: React.CSSProperties = {
  borderRadius: "20px",
  padding: "1.75rem",
  textDecoration: "none",
  display: "block",
};

const typeName: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.375rem",
  color: "var(--text)",
  letterSpacing: "-.02em",
  marginBottom: ".375rem",
};

const typeDesc: React.CSSProperties = {
  fontSize: ".875rem",
  color: "var(--text-mid)",
  marginBottom: "1.25rem",
};

const typeCta: React.CSSProperties = {
  fontSize: ".875rem",
  fontWeight: 700,
  color: "var(--text-mid)",
};

const emptyArea: React.CSSProperties = {
  background: "#fff",
  borderRadius: "20px",
  padding: "3.5rem 2rem",
  textAlign: "center",
  border: "1.5px dashed var(--ground-2)",
};

const emptyIcon: React.CSSProperties = {
  fontSize: "2.5rem",
  marginBottom: "1rem",
};

const emptyTitle: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.25rem",
  color: "var(--text)",
  marginBottom: ".5rem",
};

const emptyDesc: React.CSSProperties = {
  fontSize: ".9375rem",
  color: "var(--text-mid)",
  marginBottom: "1.5rem",
};

const emptyBtn: React.CSSProperties = {
  display: "inline-block",
  padding: ".6rem 1.5rem",
  borderRadius: "999px",
  background: "var(--accent)",
  color: "#fff",
  fontWeight: 700,
  textDecoration: "none",
  fontSize: ".9375rem",
  fontFamily: "var(--font-display, Nunito, sans-serif)",
};
