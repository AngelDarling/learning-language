export default function HomePage() {
  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: ".75rem",
          color: "var(--teal)",
          letterSpacing: ".12em",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        LangMaster · v0.1 · setup complete
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700,
          letterSpacing: "-.03em",
          lineHeight: 1.1,
          marginBottom: "1rem",
          color: "var(--text)",
        }}
      >
        Hệ thống đã sẵn sàng.
      </h1>
      <p style={{ color: "var(--text-dim)", maxWidth: "40ch", lineHeight: 1.7 }}>
        Next.js + TypeScript + Tailwind + MongoDB schemas đã được cấu hình.
        Bước tiếp theo: xây dựng Auth và routing.
      </p>
    </main>
  );
}
