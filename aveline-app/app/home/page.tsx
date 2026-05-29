import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import DashboardClient from "../../components/DashboardClient";

export default async function HomePage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");

  return <DashboardClient userId={auth.sub} email={auth.email} />;
}