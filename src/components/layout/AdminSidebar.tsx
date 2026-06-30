"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin",           label: "Tổng quan",    icon: "📊" },
  { href: "/admin/users",     label: "Người dùng",   icon: "👥" },
  { href: "/admin/content",   label: "Nội dung",     icon: "📝" },
  { href: "/admin/questions", label: "Câu hỏi",      icon: "❓" },
  { href: "/dashboard",       label: "← Học viên",   icon: "🏠" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={aside}>
      <div style={brand}>
        <Link href="/admin" style={logo}>LangMaster<span style={dot}></span></Link>
        <span style={adminTag}>Admin</span>
      </div>

      <nav style={nav}>
        {navItems.map(item => {
          const active = item.href !== "/dashboard" &&
            (pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)));
          return (
            <Link key={item.href} href={item.href} style={active ? activeItem : navItem}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const aside: React.CSSProperties = {
  width: "220px",
  minHeight: "100vh",
  background: "var(--text)",
  padding: "1.5rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  position: "sticky",
  top: 0,
  alignSelf: "flex-start",
  flexShrink: 0,
};

const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".5rem",
  paddingLeft: ".5rem",
};

const logo: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.125rem",
  color: "#fff",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: ".3rem",
};

const dot: React.CSSProperties = {
  width: "7px", height: "7px",
  borderRadius: "50%",
  background: "var(--accent)",
  display: "inline-block",
  marginBottom: "2px",
};

const adminTag: React.CSSProperties = {
  fontSize: ".65rem",
  fontWeight: 700,
  letterSpacing: ".08em",
  textTransform: "uppercase",
  background: "var(--peach)",
  color: "#7a3010",
  padding: ".15rem .5rem",
  borderRadius: "999px",
};

const nav: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: ".25rem",
};

const base: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: ".75rem",
  padding: ".625rem .875rem",
  borderRadius: "12px",
  fontSize: ".9rem",
  fontWeight: 500,
  textDecoration: "none",
  transition: "background .15s",
};

const navItem: React.CSSProperties = {
  ...base,
  color: "rgba(255,255,255,.55)",
  background: "transparent",
};

const activeItem: React.CSSProperties = {
  ...base,
  color: "#fff",
  background: "rgba(255,255,255,.1)",
  fontWeight: 700,
};
