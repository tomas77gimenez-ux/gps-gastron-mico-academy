import { Link } from "@tanstack/react-router";
import { ChefHat, Mail, Instagram, Youtube, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { useState } from "react";

export function Footer() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const year = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("¡Gracias por suscribirte!");
    setEmail("");
  };

  return (
    <footer className="relative mt-24 border-t border-border bg-surface/60">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + newsletter */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl glass flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-primary" strokeWidth={1.5} />
              </div>
              <span className="font-display font-bold text-lg">GPS Gastronômico</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t("footer.tagline")}
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground block">
                {t("footer.newsletter")}
              </label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.email")}
                  className="flex-1"
                />
                <Button type="submit" size="sm" className="shrink-0">
                  {t("footer.suscribir")}
                </Button>
              </div>
            </form>
          </div>

          {/* Explorar */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-sm mb-4">{t("footer.explorar")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("nav.inicio")}</Link></li>
              <li><Link to="/cursos" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("nav.mentoria")}</Link></li>
              <li><Link to="/planes" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("nav.planes")}</Link></li>
              <li><Link to="/tienda" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("nav.productos")}</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-sm mb-4">{t("footer.recursos")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/herramientas/dre" className="link-underline text-muted-foreground hover:text-primary transition-colors">DRE</Link></li>
              <li><Link to="/dashboard" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("footer.dashboard")}</Link></li>
              <li><Link to="/asistente" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("footer.asistente")}</Link></li>
              <li><Link to="/perfil" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("nav.perfil")}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-sm mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terminos" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("footer.terminos")}</Link></li>
              <li><Link to="/privacidad" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("footer.privacidad")}</Link></li>
              <li><Link to="/reembolsos" className="link-underline text-muted-foreground hover:text-primary transition-colors">{t("footer.reembolsos")}</Link></li>
            </ul>
          </div>

          {/* Contacto + Social */}
          <div className="lg:col-span-2">
            <h4 className="font-display font-semibold text-sm mb-4">{t("footer.contacto")}</h4>
            <a
              href="mailto:hola@gpsgastronomico.com"
              className="link-underline mb-4 inline-flex max-w-full items-center gap-2 break-all text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0" />
              hola@gpsgastronomico.com
            </a>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/gestionderestaurantes/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @gestionderestaurantes"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground transition-all duration-200 hover:text-primary hover:border-primary/40 hover:-translate-y-0.5"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@danielgimenezcoach"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube @danielgimenezcoach"
                className="w-9 h-9 rounded-xl glass flex items-center justify-center text-muted-foreground transition-all duration-200 hover:text-primary hover:border-primary/40 hover:-translate-y-0.5"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-muted-foreground">
          <p>© {year} GPS Gastronômico. {t("footer.derechos")}</p>
          <p className="inline-flex items-center gap-1.5">
            {t("footer.hechoCon")} <Heart className="w-3 h-3 fill-primary text-primary" /> {t("footer.para")}
          </p>
        </div>
      </div>
    </footer>
  );
}