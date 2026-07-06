import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "platform_info",
  title: "Información de la plataforma",
  description:
    "Devuelve información general sobre la plataforma GPS Gastronómico: propósito, público objetivo e idioma.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({
          name: "GPS Gastronómico",
          description:
            "Plataforma de membresía para consultoría gastronómica: cursos, mentoría, herramientas (DRE) y tienda para dueños y gestores de restaurantes.",
          language: "es",
          audience: "Dueños, gestores y equipos de restaurantes",
        }),
      },
    ],
  }),
});