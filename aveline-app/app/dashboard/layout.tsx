import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import BottomNav, { type UserRole } from "@/components/dashboard/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  return (
    <div className="mobile-shell">
      {/* Page content fills available space */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {children}
      </div>

      {/* Role-aware bottom nav */}
      <BottomNav role={auth.role as UserRole} />
    </div>
  );
}