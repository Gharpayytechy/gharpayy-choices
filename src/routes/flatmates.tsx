// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import FlatmatesApp from "@/flatmates/frontend/FlatmatesApp";

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
  return <FlatmatesApp />;
}
