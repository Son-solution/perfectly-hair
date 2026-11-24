"use client";

import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";
import { AppointmentsBoard } from "./AppointmentsBoard";

export function AppointmentsFromUrl(props: Omit<ComponentProps<typeof AppointmentsBoard>, "initialStatus">) {
  const status = useSearchParams().get("status");
  return <AppointmentsBoard key={status ?? "all"} {...props} initialStatus={status} />;
}
