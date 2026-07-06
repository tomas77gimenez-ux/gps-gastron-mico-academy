import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import platformInfoTool from "./tools/platform-info";

export default defineMcp({
  name: "gps-gastronomico-mcp",
  title: "GPS Gastronómico MCP",
  version: "0.1.0",
  instructions:
    "Herramientas públicas de GPS Gastronómico. Usa `echo` para verificar la conexión y `platform_info` para obtener información general sobre la plataforma.",
  tools: [echoTool, platformInfoTool],
});