// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const FlatmatesApp = lazy(() => import("@/flatmates/frontend/FlatmatesApp"));

export const Route = createFileRoute("/flatmates/$")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Discover Rooms & Flatmates · Gharpayy" },
      { name: "description", content: "Search rooms, flatmate profiles, groups and whole homes by city, locality, budget and lifestyle." },
      { property: "og:title", content: "Flatmates · Discover rooms, people and groups" },
      { property: "og:description", content: "Rooms, flatmate profiles, groups and meetings inside Gharpayy Flatmates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FlatmatesSplat,
});

function FlatmatesSplat() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center text-muted-foreground">Loading Flatmates…</div>}>
      <FlatmatesApp />
    </Suspense>
  );
}
