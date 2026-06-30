"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div style={card}>
      <div style={logoRow}>
        <span style={logotype}>LangMaster</span>
        <span style={logodot}></span>
      </div>

      <h1 style={heading}>Chào mừng trở lại</h1>
      <p style={sub}>Đăng nhập để tiếp tục lộ trình học của bạn.</p>

      <form onSubmit={handleSubmit} style={form} noValidate>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <label htmlFor="password" style={label}>Mật khẩu</label>
            <Link href="/forgot-password" style={forgotLink}>Quên mật khẩu?</Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={input}
          />
        </div>

        {error && <p style={errorMsg} role="alert">{error}</p>}

        <button type="submit" disabled={loading} style={loading ? btnDisabled : btn}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p style={footer}>
        Chưa có tài khoản?{" "}
        <Link href="/register" style={linkStyle}>Đăng ký miễn phí</Link>
      </p>
    </div>
  );
}

// ── Inline styles (no Tailwind dependency in auth pages) ──

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
  gap: "1.25rem",
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
  transition: "border-color .15s",
  fontFamily: "inherit",
  width: "100%",
};

const forgotLink: React.CSSProperties = {
  fontSize: ".8rem",
  color: "var(--text-dim)",
  textDecoration: "none",
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
  transition: "background .15s, transform .15s",
  marginTop: ".25rem",
};

const btnDisabled: React.CSSProperties = {
  ...btn,
  opacity: .6,
  cursor: "not-allowed",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  fontSize: ".875rem",
  color: "var(--text-dim)",
  marginTop: "1.5rem",
};

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  fontWeight: 600,
  textDecoration: "none",
};
