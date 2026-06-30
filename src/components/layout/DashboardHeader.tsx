import { auth, signOut } from "@/lib/auth";

export async function DashboardHeader() {
  const session = await auth();
  const user = session?.user as { name?: string | null; role?: string } | undefined;

  return (
    <header style={header}>
      <div style={right}>
        {user?.role === "admin" && (
          <a href="/admin" style={adminChip}>⚙️ Admin</a>
        )}
        <span style={userName}>{user?.name}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" style={signOutBtn}>Đăng xuất</button>
        </form>
      </div>
    </header>
  );
}

const header: React.CSSProperties = {
  height: "56px",
  background: "#fff",
  borderBottom: "1.5px solid var(--ground-2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: "0 2rem",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const right: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
};

const userName: React.CSSProperties = {
  fontSize: ".875rem",
  color: "var(--text-mid)",
  fontWeight: 500,
};

const adminChip: React.CSSProperties = {
  fontSize: ".8rem",
  color: "#7a3010",
  background: "var(--peach)",
  padding: ".25rem .75rem",
  borderRadius: "999px",
  fontWeight: 600,
  textDecoration: "none",
};

const signOutBtn: React.CSSProperties = {
  background: "none",
  border: "1.5px solid var(--ground-2)",
  borderRadius: "999px",
  padding: ".3rem .875rem",
  fontSize: ".8125rem",
  color: "var(--text-mid)",
  cursor: "pointer",
  fontFamily: "inherit",
};
