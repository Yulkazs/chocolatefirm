import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import KlachtenClient from "@/components/dashboard/klachten/KlachtenClient";
 
export const dynamic = "force-dynamic";
 
export default async function KlachtenPage() {
  const auth = await getAuth();
  if (!auth) redirect("/login");
 
  if (!["CUSTOMER_SERVICE", "ADMIN"].includes(auth.role)) redirect("/dashboard");
 
  const complaints = await prisma.complaint.findMany({
    include: {
      user:    { select: { firstName: true, lastName: true, email: true } },
      product: { select: { name: true, batchNumber: true } },
    },
    orderBy: [
      { priority: "asc" },   // HIGH sorts before MEDIUM before LOW in the enum
      { createdAt: "desc" },
    ],
  });
 
  return <KlachtenClient complaints={complaints} />;
}