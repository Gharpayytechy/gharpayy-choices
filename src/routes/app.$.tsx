// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SuperApp = lazy(() => import("@/referral-app/App"));

export const Route = createFileRoute("/app/$")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gharpayy Super App · Refer, Earn, Track" },
      { name: "description", content: "Persona-based referral super app for Bengaluru renters, brokers, PG managers, and corporate HRs." },
    ],
  }),
  component: SuperAppRoute,
});

function SuperAppRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading super app…</div>}>
      <SuperApp />
    </Suspense>
  );
}
