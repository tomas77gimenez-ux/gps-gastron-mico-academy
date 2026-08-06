import { auth, defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import platformInfoTool from "./tools/platform-info";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://xovgygwweabinsdmkasb.supabase.co";

export default defineMcp({
  name: "gps-gastronomico-mcp",
  title: "GPS Gastronómico MCP",
  version: "0.1.0",
  auth: auth.oauth.issuer({
    issuer: `${SUPABASE_URL}/auth/v1`,
    jwksUri: `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
    acceptedAudiences: "authenticated",
    resourceName: "GPS Gastronómico MCP",
  }),
  instructions:
    "Herramientas de GPS Gastronómico (requieren cuenta autenticada). Usa `echo` para verificar la conexión y `platform_info` para obtener información general sobre la plataforma.",
  tools: [echoTool, platformInfoTool],
});