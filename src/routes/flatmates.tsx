// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const FlatmatesApp = lazy(() => import("@/flatmates/frontend/FlatmatesApp"));

export const Route = createFileRoute("/flatmates")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gharpayy Flatmates · Rooms Across India" },
      { name: "description", content: "Find rooms, flatmates, groups and whole homes across Indian cities, with verified profiles and direct support." },
      { property: "og:title", content: "Gharpayy Flatmates · Find your room & flatmate" },
      { property: "og:description", content: "Rooms, flatmates, groups and whole homes across India, connected in one app." },
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
