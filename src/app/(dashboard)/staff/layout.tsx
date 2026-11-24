import { DashboardShell } from "@/components/dashboard/Shell";
import { DEMO_STAFF_ID, getOwnProfile } from "@/features/dashboard/repository";

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const me = await getOwnProfile(DEMO_STAFF_ID);
  return (
    <DashboardShell area="staff" userName={me ? `${me.firstName} ${me.lastName}` : "Mitarbeiter"} userRole="Mitarbeiterin · Vorschau">
      {children}
    </DashboardShell>
  );
}
