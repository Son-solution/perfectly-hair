import { Badge, Card, DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { addDays, fmtDate, isoWeekday } from "@/features/dashboard/calc";
import { LEAVE_LABEL } from "@/features/dashboard/domain";
import { DEMO, DEMO_STAFF_ID, getEmployee, listLeaveForEmployee } from "@/features/dashboard/repository";
import { cn } from "@/lib/utils";

export default async function StaffSchedulePage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  const leave = (await listLeaveForEmployee(me.id)).filter((l) => l.status === "genehmigt" && l.to >= DEMO.today);
  const monday = addDays(DEMO.today, -(isoWeekday(DEMO.today) - 1));
  const weeks = [0, 1].map((w) => Array.from({ length: 7 }, (_, i) => addDays(monday, w * 7 + i)));
  return (
    <>
      <PageHeader eyebrow="Mein Bereich" title="Dienstplan" description="Deine Schichten der nächsten zwei Wochen." />
      <DemoBanner />
      <div className="space-y-4">
        {weeks.map((days, wi) => (
          <Card key={wi} title={wi === 0 ? "Diese Woche" : "Nächste Woche"} padded={false}>
            <ul className="divide-y divide-dash-border">
              {days.map((d) => {
                const s = me.schedule[String(isoWeekday(d))];
                const off = leave.find((l) => d >= l.from && d <= l.to);
                return (
                  <li key={d} className={cn("flex items-center justify-between gap-3 px-5 py-3.5 text-sm", d === DEMO.today && "bg-dash-raised")}>
                    <span className={cn(d === DEMO.today && "font-semibold")}>
                      {fmtDate(d, { weekday: "long", day: "numeric", month: "short" })}{d === DEMO.today && " · heute"}
                    </span>
                    {off ? <Badge tone="dashed">{LEAVE_LABEL[off.type]}</Badge>
                      : s ? <Badge tone="solid">{s.start} – {s.end} · Pause {s.breakMin} Min.</Badge>
                      : <Badge tone="muted">Frei</Badge>}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
        <Card title="Anstehender Urlaub">
          {leave.length === 0 ? <p className="text-sm text-dash-muted">Kein genehmigter Urlaub geplant.</p> : (
            <ul className="space-y-2 text-sm">
              {leave.map((l) => <li key={l.id}>{LEAVE_LABEL[l.type]} · {fmtDate(l.from)} – {fmtDate(l.to)}</li>)}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
