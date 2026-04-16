import { createFileRoute } from "@tanstack/react-router";
import { User, BookOpen, ShoppingBag, Award } from "lucide-react";
import { useI18n } from "@/lib/i18n";

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
  const { t } = useI18n();
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold font-display mb-8">{t("perfil.titulo")}</h1>

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
          <p className="text-sm text-muted-foreground mt-4">{t("perfil.miembro")}</p>
        </div>

        <div className="grid gap-6">
          {[
            { icon: BookOpen, title: t("perfil.misCursos"), desc: t("perfil.cursosDesc") },
            { icon: ShoppingBag, title: t("perfil.misCompras"), desc: t("perfil.comprasDesc") },
            { icon: Award, title: t("perfil.certificados"), desc: t("perfil.certificadosDesc") },
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
