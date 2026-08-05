import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/herramientas/dre-mensual")({
  beforeLoad: () => {
    throw redirect({ to: "/herramientas/dre" });
  },
});
