// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SuperApp = lazy(() => import("@/referral-app/App"));

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gharpayy Refer & Earn Super App" },
      { name: "description", content: "Mobile-first referral, lead tracking, admin handover, and persona dashboards for Gharpayy." },
    ],
  }),
  component: SuperAppIndexRoute,
});

function SuperAppIndexRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading Refer & Earn…</div>}>
      <SuperApp />
    </Suspense>
  );
}