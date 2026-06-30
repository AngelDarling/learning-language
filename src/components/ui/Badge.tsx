type BadgeVariant = "mint" | "peach" | "lavender" | "sky" | "yellow" | "accent" | "dim";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, React.CSSProperties> = {
  mint:     { background: "var(--mint)",     color: "#0f5c44" },
  peach:    { background: "var(--peach)",    color: "#7a3010" },
  lavender: { background: "var(--lavender)", color: "#4a3a7a" },
  sky:      { background: "var(--sky)",      color: "#1a4a7a" },
  yellow:   { background: "var(--yellow)",   color: "#5a4a00" },
  accent:   { background: "var(--accent)",   color: "#fff" },
  dim:      { background: "var(--ground-2)", color: "var(--text-dim)" },
};

export function Badge({ variant = "dim", children }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: ".2rem .65rem",
        borderRadius: "999px",
        fontSize: ".75rem",
        fontWeight: 600,
        whiteSpace: "nowrap",
        ...variants[variant],
      }}
    >
      {children}
    </span>
  );
}
