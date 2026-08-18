// @ts-nocheck
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/gharpayy_/flatmates/$")({
  ssr: false,
  beforeLoad: ({ location }) => { throw redirect({ href: location.pathname.replace("/gharpayy/flatmates", "/flatmates") + location.searchStr, statusCode: 301 }); },
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
  component: () => null,
});
