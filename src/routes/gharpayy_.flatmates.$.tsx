// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/gharpayy_/flatmates/$")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Flatmates · Discover rooms, people and groups" },
      { name: "description", content: "Browse rooms, flatmate profiles, groups, meetings and your household inside Gharpayy Flatmates." },
      { property: "og:title", content: "Flatmates · Discover rooms, people and groups" },
      { property: "og:description", content: "Rooms, flatmate profiles, groups and meetings inside Gharpayy Flatmates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LegacyFlatmatesSplatRedirect,
});

function LegacyFlatmatesSplatRedirect() {
  useEffect(() => { window.location.replace(window.location.pathname.replace("/gharpayy/flatmates", "/flatmates") + window.location.search); }, []);
  return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Opening Flatmates…</div>;
}
