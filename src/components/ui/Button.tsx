import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--accent)", color: "#fff", border: "none" },
  secondary: { background: "var(--mint)", color: "#0f5c44", border: "none" },
  ghost: { background: "transparent", color: "var(--text-mid)", border: "1.5px solid var(--ground-2)" },
  danger: { background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fecaca" },
};

const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: ".35rem .875rem", fontSize: ".8125rem" },
  md: { padding: ".6rem 1.25rem", fontSize: ".9375rem" },
  lg: { padding: ".8rem 2rem", fontSize: "1rem" },
};

const base: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: ".4rem",
  borderRadius: "999px",
  fontFamily: "var(--font-display, Nunito, sans-serif)",
  fontWeight: 700,
  cursor: "pointer",
  transition: "opacity .15s, transform .15s",
  whiteSpace: "nowrap",
  textDecoration: "none",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, children, style, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{
          ...base,
          ...styles[variant],
          ...sizes[size],
          opacity: disabled || loading ? 0.6 : 1,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          ...style,
        }}
        {...rest}
      >
        {loading ? "Đang xử lý..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
