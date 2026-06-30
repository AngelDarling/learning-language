import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user as { role?: string } | undefined;

  if (!session?.user) redirect("/login");
  if (user?.role !== "admin") redirect("/dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--ground)" }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ flex: 1, padding: "2rem clamp(1.5rem, 4vw, 3rem)", maxWidth: "1100px", width: "100%", margin: "0 auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
