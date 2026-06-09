import { createFileRoute, redirect } from "@tanstack/react-router";

// Unified: /refer is now part of the Super App at /app/refer.
export const Route = createFileRoute("/refer")({
  beforeLoad: () => {
    throw redirect({ to: "/app/$", params: { _splat: "refer" } });
  },
  component: () => null,
});
