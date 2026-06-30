"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!data.success) {
      setError(data.error ?? "Đã có lỗi xảy ra.");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div style={card}>
      <div style={logoRow}>
        <span style={logotype}>LangMaster</span>
        <span style={logodot}></span>
      </div>

      <h1 style={heading}>Tạo tài khoản</h1>
      <p style={sub}>Miễn phí 7 ngày, không cần thẻ tín dụng.</p>

      <form onSubmit={handleSubmit} style={form} noValidate>
        <div style={field}>
          <label htmlFor="name" style={label}>Tên của bạn</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nguyễn Văn A"
            style={input}
          />
        </div>

        <div style={field}>
          <label htmlFor="email" style={label}>Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="ten@example.com"
            style={input}
          />
        </div>

        <div style={field}>
          <label htmlFor="password" style={label}>
            Mật khẩu
            <span style={{ fontSize: ".75rem", color: "var(--text-dim)", marginLeft: ".5rem" }}>
              (ít nhất 8 ký tự)
            </span>
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={input}
          />
        </div>

        {error && <p style={errorMsg} role="alert">{error}</p>}

        <button type="submit" disabled={loading} style={loading ? btnDisabled : btn}>
          {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản miễn phí"}
        </button>
      </form>

      <p style={{ textAlign: "center", fontSize: ".75rem", color: "var(--text-dim)", marginTop: "1rem", lineHeight: 1.5 }}>
        Bằng cách đăng ký, bạn đồng ý với{" "}
        <Link href="/terms" style={linkStyle}>Điều khoản dịch vụ</Link>
        {" "}và{" "}
        <Link href="/privacy" style={linkStyle}>Chính sách bảo mật</Link>.
      </p>

      <p style={footer}>
        Đã có tài khoản?{" "}
        <Link href="/login" style={linkAccent}>Đăng nhập</Link>
      </p>
    </div>
  );
}

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  background: "#fff",
  borderRadius: "24px",
  padding: "2.5rem",
  boxShadow: "0 4px 24px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.05)",
};

const logoRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".375rem",
  marginBottom: "2rem",
};

const logotype: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.125rem",
  color: "var(--text)",
};

const logodot: React.CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "var(--accent)",
  display: "inline-block",
  marginBottom: "2px",
};

const heading: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.625rem",
  letterSpacing: "-.02em",
  marginBottom: ".375rem",
  color: "var(--text)",
};

const sub: React.CSSProperties = {
  fontSize: ".9rem",
  color: "var(--text-dim)",
  marginBottom: "2rem",
};

const form: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.125rem",
};

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: ".375rem",
};

const label: React.CSSProperties = {
  fontSize: ".875rem",
  fontWeight: 500,
  color: "var(--text-mid)",
};

const input: React.CSSProperties = {
  padding: ".7rem 1rem",
  borderRadius: "10px",
  border: "1.5px solid var(--ground-2)",
  background: "var(--ground)",
  fontSize: ".9375rem",
  color: "var(--text)",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
};

const errorMsg: React.CSSProperties = {
  fontSize: ".875rem",
  color: "var(--danger, #DC2626)",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: ".625rem .875rem",
};

const btn: React.CSSProperties = {
  padding: ".8rem",
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "999px",
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: ".25rem",
};

const btnDisabled: React.CSSProperties = { ...btn, opacity: .6, cursor: "not-allowed" };

const footer: React.CSSProperties = {
  textAlign: "center",
  fontSize: ".875rem",
  color: "var(--text-dim)",
  marginTop: "1.25rem",
};

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  textDecoration: "none",
};

const linkAccent: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: 600,
  textDecoration: "none",
};
