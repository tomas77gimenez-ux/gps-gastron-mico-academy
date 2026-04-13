import { createFileRoute } from "@tanstack/react-router";
import { User, BookOpen, ShoppingBag, Award } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  component: PerfilPage,
  head: () => ({
    meta: [
      { title: "Mi Perfil — GPS Gastronômico" },
      { name: "description", content: "Gestiona tu cuenta, cursos y compras." },
    ],
  }),
});

function PerfilPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold font-display mb-8">Mi Perfil</h1>

        {/* Profile card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Usuario Demo</h2>
              <p className="text-sm text-muted-foreground">usuario@ejemplo.com</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                Plan Premium
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Miembro desde enero 2025</p>
        </div>

        {/* Sections */}
        <div className="grid gap-6">
          {[
            { icon: BookOpen, title: "Mis Cursos", desc: "2 cursos en progreso" },
            { icon: ShoppingBag, title: "Mis Compras", desc: "3 productos adquiridos" },
            { icon: Award, title: "Certificados", desc: "0 certificados obtenidos" },
          ].map((section) => (
            <div key={section.title} className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
