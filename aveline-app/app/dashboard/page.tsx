import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  return <DashboardClient userId={auth.sub} email={auth.email} role={auth.role} />;
}