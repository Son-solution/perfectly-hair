import Link from "next/link";
import { Avatar, Badge, Card, DemoBanner, PageHeader, Table, Td, Th, btn } from "@/components/dashboard/ui";
import { effective, fmtDuration, monthTotals } from "@/features/dashboard/calc";
import { ROLE_LABEL } from "@/features/dashboard/domain";
import { DEMO, listAttendance, listEmployees } from "@/features/dashboard/repository";

export default async function EmployeesPage() {
  const [employees, attendance] = await Promise.all([listEmployees(), listAttendance()]);
  const month = DEMO.today.slice(0, 7);
  return (
    <>
      <PageHeader
        eyebrow="Betrieb"
        title="Mitarbeiter"
        description="Verzeichnis, Rollen, Dienstpläne und Stunden im laufenden Monat."
        actions={<button type="button" className={btn("primary")} disabled title="Verfügbar nach Anbindung (Phase 5B)">Mitarbeiter anlegen</button>}
      />
      <DemoBanner />
      <Card>
        <Table label="Mitarbeiterverzeichnis">
          <thead><tr><Th>Name</Th><Th>Position</Th><Th>Rolle</Th><Th>Vertrag</Th><Th>Stunden (Monat)</Th><Th>Status heute</Th></tr></thead>
          <tbody>
            {employees.map((e) => {
              const t = monthTotals(e, attendance, month, DEMO.today);
              const rec = attendance.find((r) => r.employeeId === e.id && r.date === DEMO.today);
              const inNow = rec && effective(rec).clockIn && !effective(rec).clockOut;
              return (
                <tr key={e.id} className="hover:bg-dash-raised">
                  <Td>
                    <Link href={`/admin/employees/${e.id}`} className="flex items-center gap-3 font-medium underline-offset-4 hover:underline">
                      <Avatar name={`${e.firstName} ${e.lastName}`} size={32} />
                      <span>{e.firstName} {e.lastName}<span className="block text-xs font-normal text-dash-muted">{e.email}</span></span>
                    </Link>
                  </Td>
                  <Td>{e.position}</Td>
                  <Td><Badge tone={e.role === "staff" ? "muted" : "outline"}>{ROLE_LABEL[e.role]}</Badge></Td>
                  <Td className="tabular-nums">{e.contractHoursWeek} h/Woche</Td>
                  <Td className="tabular-nums">
                    {fmtDuration(t.worked)}
                    <span className="block text-xs text-dash-muted">Soll {fmtDuration(t.scheduled)} · {t.overtime >= 0 ? "+" : ""}{fmtDuration(t.overtime)}</span>
                  </Td>
                  <Td><Badge tone={inNow ? "solid" : "dashed"}>{inNow ? "Eingestempelt" : "Nicht im Dienst"}</Badge></Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
