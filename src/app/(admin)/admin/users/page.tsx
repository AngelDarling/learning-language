"use client";

import { useEffect, useState, useCallback } from "react";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  warnings: { reason: string; issuedAt: string }[];
  bannedAt?: string;
  createdAt: string;
  streakDays: number;
}

type ModalState =
  | { type: "warn" | "ban"; user: AdminUser }
  | { type: "detail"; user: AdminUser }
  | null;

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("");
  const [page, setPage]         = useState(1);
  const [modal, setModal]       = useState<ModalState>(null);
  const [reason, setReason]     = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [acting, setActing]     = useState(false);

  const totalPages = Math.ceil(total / 20);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (filter) params.set("status", filter);

    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    if (data.success) {
      setUsers(data.data);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function doAction(userId: string, action: string, payload?: Record<string, string>) {
    setActing(true);
    setActionMsg("");
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json();
    setActing(false);
    if (data.success) {
      setModal(null);
      setReason("");
      load();
    } else {
      setActionMsg(data.error ?? "Lỗi không xác định");
    }
  }

  return (
    <div>
      <h1 style={h1}>Quản lý người dùng</h1>
      <p style={lead}>Tổng cộng <strong>{total}</strong> tài khoản.</p>

      {/* Search + filter */}
      <div style={toolbar}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm theo tên hoặc email..."
          style={searchInput}
        />
        <div style={filterChips}>
          {[
            { value: "",        label: "Tất cả" },
            { value: "active",  label: "Hoạt động" },
            { value: "warned",  label: "Cảnh cáo" },
            { value: "banned",  label: "Đã khóa" },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => { setFilter(f.value); setPage(1); }}
              style={filter === f.value ? activeChip : chip}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={tableWrap}>
        <div style={thead}>
          <div style={th}>Người dùng</div>
          <div style={th}>Role</div>
          <div style={th}>Trạng thái</div>
          <div style={th}>Streak</div>
          <div style={th}>Đăng ký</div>
          <div style={th}>Hành động</div>
        </div>

        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>Đang tải...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>
            Không tìm thấy người dùng nào.
          </div>
        ) : users.map(u => (
          <div key={u._id} style={trow}>
            <div style={td}>
              <div style={userName}>{u.name}</div>
              <div style={userEmail}>{u.email}</div>
            </div>
            <div style={td}>
              <span style={u.role === "admin" ? roleAdmin : u.role === "moderator" ? roleMod : roleUser}>
                {u.role}
              </span>
            </div>
            <div style={td}>
              <span style={
                u.status === "banned" ? statusBanned :
                u.status === "warned" ? statusWarned : statusActive
              }>
                {u.status === "banned" ? "Đã khóa" : u.status === "warned" ? "Cảnh cáo" : "Hoạt động"}
                {u.warnings?.length > 0 && ` (${u.warnings.length})`}
              </span>
            </div>
            <div style={{ ...td, fontWeight: 600 }}>{u.streakDays} ngày</div>
            <div style={{ ...td, color: "var(--text-dim)", fontSize: ".8125rem" }}>
              {new Date(u.createdAt).toLocaleDateString("vi-VN")}
            </div>
            <div style={{ ...td, display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
              <button onClick={() => setModal({ type: "detail", user: u })} style={btnInfo}>
                Chi tiết
              </button>
              {u.status !== "banned" && (
                <>
                  <button onClick={() => { setModal({ type: "warn", user: u }); setReason(""); }} style={btnWarn}>
                    Cảnh cáo
                  </button>
                  <button onClick={() => { setModal({ type: "ban", user: u }); setReason(""); }} style={btnBan}>
                    Khóa
                  </button>
                </>
              )}
              {u.status === "banned" && (
                <button onClick={() => doAction(u._id, "unban")} style={btnUnban}>
                  Mở khóa
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={pagination}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pageBtn}>
            ← Trước
          </button>
          <span style={{ fontSize: ".875rem", color: "var(--text-mid)" }}>
            Trang {page} / {totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pageBtn}>
            Tiếp →
          </button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={overlay} onClick={() => setModal(null)}>
          <div style={modalBox} onClick={e => e.stopPropagation()}>
            {modal.type === "detail" && (
              <>
                <h3 style={modalTitle}>Chi tiết: {modal.user.name}</h3>
                <dl style={dl}>
                  <dt style={dt}>Email</dt>      <dd style={dd}>{modal.user.email}</dd>
                  <dt style={dt}>Role</dt>       <dd style={dd}>{modal.user.role}</dd>
                  <dt style={dt}>Trạng thái</dt><dd style={dd}>{modal.user.status}</dd>
                  <dt style={dt}>Streak</dt>     <dd style={dd}>{modal.user.streakDays} ngày</dd>
                  <dt style={dt}>Đăng ký</dt>    <dd style={dd}>{new Date(modal.user.createdAt).toLocaleDateString("vi-VN")}</dd>
                </dl>
                {modal.user.warnings?.length > 0 && (
                  <>
                    <p style={{ fontSize: ".875rem", fontWeight: 600, color: "var(--text)", marginBottom: ".5rem" }}>
                      Lịch sử cảnh cáo ({modal.user.warnings.length})
                    </p>
                    {modal.user.warnings.map((w, i) => (
                      <div key={i} style={warnItem}>
                        <span style={{ fontSize: ".8125rem", color: "var(--text-mid)" }}>
                          {new Date(w.issuedAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span style={{ fontSize: ".875rem" }}>{w.reason}</span>
                      </div>
                    ))}
                  </>
                )}
                {modal.user.bannedAt && (
                  <p style={{ fontSize: ".875rem", color: "#991b1b", marginTop: ".5rem" }}>
                    Khóa lúc: {new Date(modal.user.bannedAt).toLocaleString("vi-VN")}
                  </p>
                )}
                <button onClick={() => setModal(null)} style={btnClose}>Đóng</button>
              </>
            )}

            {(modal.type === "warn" || modal.type === "ban") && (
              <>
                <h3 style={modalTitle}>
                  {modal.type === "warn" ? "Cảnh cáo" : "Khóa tài khoản"}: {modal.user.name}
                </h3>
                <p style={{ fontSize: ".9rem", color: "var(--text-mid)", marginBottom: "1rem" }}>
                  {modal.type === "warn"
                    ? "Người dùng sẽ nhận cảnh cáo. Nhiều cảnh cáo có thể dẫn đến khóa tài khoản."
                    : "Tài khoản sẽ bị khóa và không thể đăng nhập."}
                </p>
                <label style={labelStyle}>
                  Lý do <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Nhập lý do rõ ràng..."
                  rows={3}
                  style={textarea}
                />
                {actionMsg && <p style={errMsg}>{actionMsg}</p>}
                <div style={{ display: "flex", gap: ".75rem", marginTop: "1.25rem" }}>
                  <button onClick={() => setModal(null)} style={btnClose}>Hủy</button>
                  <button
                    onClick={() => doAction(modal.user._id, modal.type, { reason })}
                    disabled={acting || reason.length < 5}
                    style={modal.type === "ban" ? btnBanLg : btnWarnLg}
                  >
                    {acting ? "Đang xử lý..." : modal.type === "warn" ? "Xác nhận cảnh cáo" : "Xác nhận khóa"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ──

const h1: React.CSSProperties = { fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.875rem", letterSpacing: "-.02em", color: "var(--text)", marginBottom: ".25rem" };
const lead: React.CSSProperties = { fontSize: "1rem", color: "var(--text-mid)", marginBottom: "1.75rem" };
const toolbar: React.CSSProperties = { display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" };
const searchInput: React.CSSProperties = { padding: ".6rem 1rem", borderRadius: "10px", border: "1.5px solid var(--ground-2)", background: "#fff", fontSize: ".9375rem", color: "var(--text)", fontFamily: "inherit", outline: "none", width: "260px" };
const filterChips: React.CSSProperties = { display: "flex", gap: ".5rem" };
const chipBase: React.CSSProperties = { padding: ".4rem 1rem", borderRadius: "999px", fontSize: ".8125rem", fontWeight: 500, cursor: "pointer", border: "1.5px solid var(--ground-2)", fontFamily: "inherit" };
const chip: React.CSSProperties = { ...chipBase, background: "#fff", color: "var(--text-mid)" };
const activeChip: React.CSSProperties = { ...chipBase, background: "var(--text)", color: "#fff", border: "1.5px solid var(--text)" };
const tableWrap: React.CSSProperties = { background: "#fff", borderRadius: "20px", border: "1.5px solid var(--ground-2)", overflow: "hidden", marginBottom: "1.5rem" };
const thead: React.CSSProperties = { display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr .8fr 1fr 1.5fr", gap: "1rem", padding: ".75rem 1.5rem", background: "var(--ground-2)", borderBottom: "1.5px solid var(--ground-2)" };
const th: React.CSSProperties = { fontSize: ".75rem", fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".06em" };
const trow: React.CSSProperties = { display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr .8fr 1fr 1.5fr", gap: "1rem", padding: ".875rem 1.5rem", borderBottom: "1px solid var(--ground-2)", alignItems: "center" };
const td: React.CSSProperties = { fontSize: ".9rem", color: "var(--text)" };
const userName: React.CSSProperties = { fontWeight: 600, fontSize: ".9rem", color: "var(--text)" };
const userEmail: React.CSSProperties = { fontSize: ".8rem", color: "var(--text-dim)" };

const badgeBase: React.CSSProperties = { display: "inline-block", padding: ".2rem .65rem", borderRadius: "999px", fontSize: ".75rem", fontWeight: 600 };
const roleAdmin: React.CSSProperties = { ...badgeBase, background: "var(--peach)", color: "#7a3010" };
const roleMod: React.CSSProperties = { ...badgeBase, background: "var(--lavender)", color: "#4a3a7a" };
const roleUser: React.CSSProperties = { ...badgeBase, background: "var(--ground-2)", color: "var(--text-dim)" };
const statusActive: React.CSSProperties = { ...badgeBase, background: "var(--mint)", color: "#0f5c44" };
const statusWarned: React.CSSProperties = { ...badgeBase, background: "var(--yellow)", color: "#5a4a00" };
const statusBanned: React.CSSProperties = { ...badgeBase, background: "#fee2e2", color: "#991b1b" };

const btnBase: React.CSSProperties = { padding: ".3rem .75rem", borderRadius: "999px", fontSize: ".8rem", fontWeight: 600, cursor: "pointer", border: "none", fontFamily: "inherit" };
const btnInfo: React.CSSProperties = { ...btnBase, background: "var(--sky)", color: "#1a4a7a" };
const btnWarn: React.CSSProperties = { ...btnBase, background: "var(--yellow)", color: "#5a4a00" };
const btnBan: React.CSSProperties = { ...btnBase, background: "#fee2e2", color: "#991b1b" };
const btnUnban: React.CSSProperties = { ...btnBase, background: "var(--mint)", color: "#0f5c44" };
const pagination: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", gap: "1.25rem" };
const pageBtn: React.CSSProperties = { ...btnBase, background: "#fff", color: "var(--text-mid)", border: "1.5px solid var(--ground-2)", padding: ".4rem 1rem" };

const overlay: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", display: "grid", placeItems: "center", zIndex: 50, padding: "1rem" };
const modalBox: React.CSSProperties = { background: "#fff", borderRadius: "24px", padding: "2rem", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,.15)" };
const modalTitle: React.CSSProperties = { fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 800, fontSize: "1.25rem", color: "var(--text)", marginBottom: "1.25rem" };
const dl: React.CSSProperties = { display: "grid", gridTemplateColumns: "auto 1fr", gap: ".375rem 1rem", marginBottom: "1.25rem" };
const dt: React.CSSProperties = { fontSize: ".8125rem", color: "var(--text-dim)", fontWeight: 600, alignSelf: "center" };
const dd: React.CSSProperties = { fontSize: ".9rem", color: "var(--text)" };
const warnItem: React.CSSProperties = { display: "flex", gap: ".75rem", padding: ".625rem 0", borderBottom: "1px solid var(--ground-2)" };
const labelStyle: React.CSSProperties = { fontSize: ".875rem", fontWeight: 500, color: "var(--text-mid)", display: "block", marginBottom: ".375rem" };
const textarea: React.CSSProperties = { width: "100%", padding: ".7rem 1rem", borderRadius: "10px", border: "1.5px solid var(--ground-2)", background: "var(--ground)", fontSize: ".9375rem", fontFamily: "inherit", resize: "vertical", outline: "none" };
const errMsg: React.CSSProperties = { fontSize: ".875rem", color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: ".5rem .875rem", marginTop: ".75rem" };
const btnClose: React.CSSProperties = { ...btnBase, background: "var(--ground-2)", color: "var(--text-mid)", padding: ".55rem 1.25rem", fontSize: ".875rem" };
const btnWarnLg: React.CSSProperties = { ...btnBase, background: "var(--yellow)", color: "#5a4a00", padding: ".55rem 1.5rem", fontSize: ".875rem" };
const btnBanLg: React.CSSProperties = { ...btnBase, background: "#fee2e2", color: "#991b1b", padding: ".55rem 1.5rem", fontSize: ".875rem" };
