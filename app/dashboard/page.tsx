import { getAuthenticatedUser } from "@/lib/auth/service";
import { redirect } from "next/navigation";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardContent user={user} />;
}