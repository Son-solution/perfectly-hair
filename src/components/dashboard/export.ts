/**
 * Client-side export helpers (Phase 5A.1). CSV uses ";" and a UTF-8 BOM so Excel (de-DE)
 * opens umlauts correctly. "PDF" = the browser's print dialog ("Als PDF speichern") with the
 * dashboard print styles. Phase 5B: server-generated PDFs with audit-log entry.
 */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][], note = "DEMO-DATEN") {
  const esc = (c: string | number) => `"${String(c).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((l) => l.map(esc).join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([`﻿# ${note}\n${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function printAsPdf() {
  window.print();
}
