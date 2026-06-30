import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, style, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: ".375rem" }}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{
            ...inputBase,
            borderColor: error ? "#fca5a5" : "var(--ground-2)",
            ...style,
          }}
          {...rest}
        />
        {error && <span style={errorStyle} role="alert">{error}</span>}
        {hint && !error && <span style={hintStyle}>{hint}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

const labelStyle: React.CSSProperties = {
  fontSize: ".875rem",
  fontWeight: 500,
  color: "var(--text-mid)",
};

const inputBase: React.CSSProperties = {
  padding: ".7rem 1rem",
  borderRadius: "10px",
  border: "1.5px solid var(--ground-2)",
  background: "#fff",
  fontSize: ".9375rem",
  color: "var(--text)",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  transition: "border-color .15s",
};

const errorStyle: React.CSSProperties = {
  fontSize: ".8rem",
  color: "#dc2626",
};

const hintStyle: React.CSSProperties = {
  fontSize: ".8rem",
  color: "var(--text-dim)",
};
