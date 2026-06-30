import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div style={shell}>
      <Sidebar />
      <div style={main}>
        <DashboardHeader />
        <div style={content}>{children}</div>
      </div>
    </div>
  );
}

const shell: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
  background: "var(--ground)",
};

const main: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
};

const content: React.CSSProperties = {
  flex: 1,
  padding: "2rem clamp(1.5rem, 4vw, 3rem)",
  maxWidth: "1100px",
  width: "100%",
  margin: "0 auto",
};
