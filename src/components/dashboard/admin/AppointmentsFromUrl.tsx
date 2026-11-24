"use client";

import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { AppointmentsBoard } from "./AppointmentsBoard";

export function AppointmentsFromUrl(props: Omit<ComponentProps<typeof AppointmentsBoard>, "initialStatus" | "initialNew">) {
  const params = useSearchParams();
  const status = params.get("status");
  const isNew = params.get("neu") === "1";
  return <AppointmentsBoard key={`${status ?? "all"}-${isNew}`} {...props} initialStatus={status} initialNew={isNew} />;
}
