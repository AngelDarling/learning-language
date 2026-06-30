"use client";

import { useEffect, useState } from "react";

interface ExamItem {
  _id: string;
  title: string;
  slug: string;
  examType: string;
  totalQuestions: number;
  timeLimitSeconds: number;
  isPremium: boolean;
  isPublished: boolean;
  maxScore: number;
  attemptCount: number;
  createdAt: string;
}

const EXAM_TYPES = ["TOEIC", "IELTS", "TOEFL", "VOCABULARY", "GRAMMAR"];

export default function AdminContentPage() {
  const [exams, setExams]       = useState<ExamItem[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState("");
  const [success, setSuccess]   = useState("");

  const [form, setForm] = useState({
    title: "", slug: "", examType: "TOEIC", description: "",
    timeLimitSeconds: 7200, maxScore: 990,
    isPremium: false, isPublished: false,
  });

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/admin/exams");
    const data = await res.json();
    if (data.success) { setExams(data.data); setTotal(data.total); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Auto-generate slug from title
  function handleTitle(val: string) {
    const slug = val.toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
      .trim().replace(/\s+/g, "-");
    setForm(f => ({ ...f, title: val, slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(""); setSuccess("");
    setSaving(true);

    const res  = await fetch("/api/admin/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!data.success) { setFormErr(data.error); return; }

    setSuccess(`Đề thi "${form.title}" đã được tạo!`);
    setForm({ title: "", slug: "", examType: "TOEIC", description: "", timeLimitSeconds: 7200, maxScore: 990, isPremium: false, isPublished: false });
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div style={pageHeader}>
        <div>
          <h1 style={h1}>Quản lý nội dung</h1>
          <p style={lead}>Tổng cộng <strong>{total}</strong> đề thi.</p>
        </div>
        <button onClick={() => { setShowForm(s => !s); setFormErr(""); setSuccess(""); }} style={newBtn}>
          {showForm ? "Hủy" : "+ Tạo đề thi mới"}
        </button>
      </div>

      {success && <div style={successBox}>{success}</div>}

      {/* Create form */}
      {showForm && (
        <div style={formCard}>
          <h2 style={formTitle}>Tạo đề thi mới</h2>
          <form onSubmit={handleSubmit} style={formGrid} noValidate>
            <div style={fieldFull}>
              <label style={labelStyle}>Tên đề thi</label>
              <input value={form.title} onChange={e => handleTitle(e.target.value)}
                placeholder="TOEIC Full Test 01" required style={inputStyle} />
            </div>

            <div style={field}>
              <label style={labelStyle}>Slug (URL)</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="toeic-full-test-01" required style={inputStyle} />
            </div>

            <div style={field}>
              <label style={labelStyle}>Loại đề</label>
              <select value={form.examType} onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}
                style={inputStyle}>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={field}>
              <label style={labelStyle}>Thời gian (giây)</label>
              <input type="number" value={form.timeLimitSeconds}
                onChange={e => setForm(f => ({ ...f, timeLimitSeconds: Number(e.target.value) }))}
                min={60} style={inputStyle} />
              <span style={hint}>{Math.round(form.timeLimitSeconds / 60)} phút</span>
            </div>

            <div style={field}>
              <label style={labelStyle}>Thang điểm tối đa</label>
              <input type="number" value={form.maxScore}
                onChange={e => setForm(f => ({ ...f, maxScore: Number(e.target.value) }))}
                min={1} style={inputStyle} />
            </div>

            <div style={fieldFull}>
              <label style={labelStyle}>Mô tả (tuỳ chọn)</label>
              <textarea value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2} placeholder="Mô tả ngắn về đề thi..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            <div style={fieldFull}>
              <div style={checkRow}>
                <label style={checkLabel}>
                  <input type="checkbox" checked={form.isPremium}
                    onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} />
                  Đề Premium (chỉ tài khoản trả phí)
                </label>
                <label style={checkLabel}>
                  <input type="checkbox" checked={form.isPublished}
                    onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} />
                  Xuất bản ngay
                </label>
              </div>
            </div>

            {formErr && <div style={{ ...errBox, gridColumn: "1/-1" }}>{formErr}</div>}

            <div style={{ gridColumn: "1/-1", display: "flex", gap: ".75rem" }}>
              <button type="submit" disabled={saving} style={saveBtn}>
                {saving ? "Đang lưu..." : "Tạo đề thi"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={cancelBtn}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Exams table */}
      <div style={tableWrap}>
        <div style={thead}>
          <div style={th}>Tên đề thi</div>
          <div style={th}>Loại</div>
          <div style={th}>Câu hỏi</div>
          <div style={th}>Thời gian</div>
          <div style={th}>Trạng thái</div>
          <div style={th}>Lượt thi</div>
        </div>

        {loading ? (
          <div style={empty}>Đang tải...</div>
        ) : exams.length === 0 ? (
          <div style={empty}>Chưa có đề thi nào. Tạo đề thi đầu tiên!</div>
        ) : exams.map(ex => (
          <div key={ex._id} style={trow}>
            <div>
              <div style={examName}>{ex.title}</div>
              <div style={examSlug}>/exam/{ex.slug}</div>
            </div>
            <div><span style={examTypeBadge}>{ex.examType}</span></div>
            <div style={td}>{ex.totalQuestions}</div>
            <div style={td}>{Math.round(ex.timeLimitSeconds / 60)} phút</div>
            <div>
              {ex.isPublished
                ? <span style={pubBadge}>Public</span>
                : <span style={draftBadge}>Draft</span>}
              {ex.isPremium && <span style={premBadge}> Premium</span>}
            </div>
            <div style={td}>{ex.attemptCount.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Styles ──

const pageHeader: React.CSSProperties = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.75rem" };
const h1: React.CSSProperties = { fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.875rem", letterSpacing: "-.02em", color: "var(--text)", marginBottom: ".25rem" };
const lead: React.CSSProperties = { fontSize: "1rem", color: "var(--text-mid)" };
const newBtn: React.CSSProperties = { padding: ".6rem 1.25rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "999px", fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 700, fontSize: ".9375rem", cursor: "pointer" };
const successBox: React.CSSProperties = { background: "var(--mint)", color: "#0f5c44", borderRadius: "12px", padding: ".875rem 1.25rem", fontSize: ".9375rem", marginBottom: "1.5rem" };
const formCard: React.CSSProperties = { background: "#fff", borderRadius: "20px", padding: "2rem", border: "1.5px solid var(--ground-2)", marginBottom: "2rem" };
const formTitle: React.CSSProperties = { fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.125rem", color: "var(--text)", marginBottom: "1.5rem" };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: ".375rem" };
const fieldFull: React.CSSProperties = { ...field, gridColumn: "1/-1" };
const labelStyle: React.CSSProperties = { fontSize: ".875rem", fontWeight: 500, color: "var(--text-mid)" };
const inputStyle: React.CSSProperties = { padding: ".65rem 1rem", borderRadius: "10px", border: "1.5px solid var(--ground-2)", background: "var(--ground)", fontSize: ".9375rem", color: "var(--text)", fontFamily: "inherit", outline: "none", width: "100%" };
const hint: React.CSSProperties = { fontSize: ".75rem", color: "var(--text-dim)" };
const checkRow: React.CSSProperties = { display: "flex", gap: "2rem" };
const checkLabel: React.CSSProperties = { display: "flex", alignItems: "center", gap: ".5rem", fontSize: ".9rem", color: "var(--text-mid)", cursor: "pointer" };
const errBox: React.CSSProperties = { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", padding: ".625rem .875rem", fontSize: ".875rem" };
const saveBtn: React.CSSProperties = { padding: ".65rem 1.75rem", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "999px", fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 700, fontSize: ".9375rem", cursor: "pointer" };
const cancelBtn: React.CSSProperties = { ...saveBtn, background: "var(--ground-2)", color: "var(--text-mid)" };
const tableWrap: React.CSSProperties = { background: "#fff", borderRadius: "20px", border: "1.5px solid var(--ground-2)", overflow: "hidden" };
const thead: React.CSSProperties = { display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1.5fr 1fr", gap: "1rem", padding: ".75rem 1.5rem", background: "var(--ground-2)" };
const th: React.CSSProperties = { fontSize: ".75rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".06em" };
const trow: React.CSSProperties = { display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1.5fr 1fr", gap: "1rem", padding: ".875rem 1.5rem", borderBottom: "1px solid var(--ground-2)", alignItems: "center" };
const td: React.CSSProperties = { fontSize: ".9rem", color: "var(--text)" };
const empty: React.CSSProperties = { padding: "3rem", textAlign: "center", color: "var(--text-dim)" };
const examName: React.CSSProperties = { fontWeight: 600, fontSize: ".9rem", color: "var(--text)" };
const examSlug: React.CSSProperties = { fontSize: ".75rem", color: "var(--text-dim)" };
const badgeBase: React.CSSProperties = { display: "inline-block", padding: ".2rem .65rem", borderRadius: "999px", fontSize: ".75rem", fontWeight: 600 };
const examTypeBadge: React.CSSProperties = { ...badgeBase, background: "var(--sky)", color: "#1a4a7a" };
const pubBadge: React.CSSProperties = { ...badgeBase, background: "var(--mint)", color: "#0f5c44" };
const draftBadge: React.CSSProperties = { ...badgeBase, background: "var(--ground-2)", color: "var(--text-dim)" };
const premBadge: React.CSSProperties = { ...badgeBase, background: "var(--peach)", color: "#7a3010" };
