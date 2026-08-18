// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const FlatmatesApp = lazy(() => import("@/flatmates/frontend/FlatmatesApp"));

export const Route = createFileRoute("/flatmates")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gharpayy Flatmates · Find your room & flatmate" },
      { name: "description", content: "Match with verified rooms, flatmates and ready-to-move flats in Bengaluru — lifestyle-matched and broker-free." },
      { property: "og:title", content: "Gharpayy Flatmates · Find your room & flatmate" },
      { property: "og:description", content: "Lifestyle-matched rooms, flatmates and ready flats in Bengaluru." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FlatmatesRoot,
});

function FlatmatesRoot() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading Flatmates…</div>}>
      <FlatmatesApp />
    </Suspense>
  );
}
