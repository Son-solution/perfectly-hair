import { TimeClock } from "@/components/dashboard/staff/TimeClock";
import { DemoBanner, PageHeader } from "@/components/dashboard/ui";
import { addDays, effective, isoWeekday, monthTotals, scheduledMinutes, workedMinutes } from "@/features/dashboard/calc";
import { DEMO, DEMO_STAFF_ID, getEmployee, listAttendanceForEmployee } from "@/features/dashboard/repository";

export default async function StaffAttendancePage() {
  const me = (await getEmployee(DEMO_STAFF_ID))!;
  const records = await listAttendanceForEmployee(me.id);
  const monday = addDays(DEMO.today, -(isoWeekday(DEMO.today) - 1));
  const week = records.filter((r) => r.date >= monday && r.date < DEMO.today).reduce((s, r) => s + (workedMinutes(effective(r)) ?? 0), 0);
  return (
    <>
      <PageHeader
        eyebrow="Mein Bereich"
        title="Zeiterfassung"
        description="Stemple Arbeitsbeginn, Pausen und Feierabend. Abgeschlossene Tage kannst du nicht selbst ändern – beantrage eine Korrektur."
      />
      <DemoBanner>Demo-Zeiterfassung: Stempelungen werden nur in dieser Ansicht simuliert und nicht gespeichert.</DemoBanner>
      <TimeClock
        today={DEMO.today}
        now={DEMO.now}
        todayRecord={records.find((r) => r.date === DEMO.today) ?? null}
        history={records}
        weekWorked={week}
        monthWorked={monthTotals(me, records, DEMO.today.slice(0, 7), DEMO.today).worked}
        scheduledToday={scheduledMinutes(me, DEMO.today)}
        shiftLabel={me.schedule[String(isoWeekday(DEMO.today))] ? `${me.schedule[String(isoWeekday(DEMO.today))]!.start}–${me.schedule[String(isoWeekday(DEMO.today))]!.end}` : null}
      />
    </>
  );
}
