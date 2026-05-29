import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import BottomNavWrapper from "@/components/dashboard/BottomNavWrapper";

// Force server re-render on every request so auth is always fresh
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  return (
    <div className="mobile-shell">
      <div className="flex-1 overflow-y-auto min-h-0">
        {children}
      </div>

      {/*
        Pass the role from the verified JWT as the initial value.
        BottomNavWrapper will re-validate client-side on mount so
        the nav always reflects the current role — even if the role
        changed since the JWT was issued.
      */}
      <BottomNavWrapper initialRole={auth.role} />
    </div>
  );
}