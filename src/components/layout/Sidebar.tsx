"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard",            label: "Tổng quan",   icon: "🏠" },
  { href: "/dashboard/exam",       label: "Luyện đề",    icon: "📝" },
  { href: "/dashboard/vocabulary", label: "Từ vựng",     icon: "🃏" },
  { href: "/dashboard/courses",    label: "Khóa học",    icon: "📚" },
  { href: "/dashboard/progress",   label: "Tiến độ",     icon: "📊" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={aside}>
      <Link href="/dashboard" style={logo}>
        LangMaster<span style={dot}></span>
      </Link>

      <nav style={nav}>
        {navItems.map(item => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} style={active ? navItemActive : navItem}>
              <span style={iconSpan}>{item.icon}</span>
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
  background: "#fff",
  borderRight: "1.5px solid var(--ground-2)",
  padding: "1.5rem 1rem",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  position: "sticky",
  top: 0,
  alignSelf: "flex-start",
  flexShrink: 0,
};

const logo: React.CSSProperties = {
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 800,
  fontSize: "1.125rem",
  color: "var(--text)",
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  gap: ".3rem",
  paddingLeft: ".5rem",
};

const dot: React.CSSProperties = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "var(--accent)",
  display: "inline-block",
  marginBottom: "2px",
};

const nav: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: ".25rem",
};

const navItemBase: React.CSSProperties = {
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
  ...navItemBase,
  color: "var(--text-mid)",
  background: "transparent",
};

const navItemActive: React.CSSProperties = {
  ...navItemBase,
  color: "var(--text)",
  background: "var(--mint)",
  fontWeight: 700,
};

const iconSpan: React.CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1,
};
