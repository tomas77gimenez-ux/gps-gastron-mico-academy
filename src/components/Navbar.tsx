import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Home, Film, ShoppingCart, User, Search, Menu, X, MessageCircle, LogIn, LogOut, Shield, CreditCard, Globe, Wrench } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSubscription } from "@/hooks/useSubscription";
import logoGps from "@/assets/logo-gps.jpg";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const sub = useSubscription();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, lang, toggleLang } = useI18n();

  const allNavItems = [
    { to: "/", label: t("nav.inicio"), icon: Home },
    { to: "/herramientas", label: t("nav.herramientas"), icon: Wrench },
    { to: "/herramientas/dre", label: "DRE", icon: LineChart },
    { to: "/cursos", label: t("nav.mentoria"), icon: Film },
    { to: "/planes", label: t("nav.planes"), icon: CreditCard },
    { to: "/tienda", label: t("nav.productos"), icon: ShoppingCart },
    { to: "/perfil", label: t("nav.perfil"), icon: User },
  ] as const;

  const navItems = sub.hasActive
    ? allNavItems.filter((item) => item.to !== "/planes")
    : allNavItems;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      if (!user) {
        if (active) setIsAdmin(false);
        return;
      }

      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (active) setIsAdmin(!!data);
    }

    void loadRole();

    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-2xl border-border-strong"
          : "bg-background/70 backdrop-blur-xl border-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src={logoGps}
              alt="Método GPS · GPS Gastronômico"
              className="h-9 sm:h-10 w-auto shrink-0 mix-blend-screen"
            />
            <span className="sr-only">GPS Gastronômico</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden min-[1100px]:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith("/admin")
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Shield className="w-4 h-4" strokeWidth={1.5} />
                Admin
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Language toggle: ES → EN → PT → ES */}
            <button
              onClick={toggleLang}
              aria-label={
                lang === "es"
                  ? "Switch to English"
                  : lang === "en"
                    ? "Mudar para Português"
                    : "Cambiar a Español"
              }
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors uppercase"
              title={
                lang === "es"
                  ? "Switch to English"
                  : lang === "en"
                    ? "Mudar para Português"
                    : "Cambiar a Español"
              }
            >
              <Globe className="w-4 h-4" />
              {lang === "es" ? "EN" : lang === "en" ? "PT" : "ES"}
            </button>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label={t("nav.buscar")}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/asistente"
              aria-label={t("nav.asistente")}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </Link>

            {/* Auth buttons */}
            {user ? (
              <button
                onClick={handleLogout}
                className="hidden min-[1100px]:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title={t("nav.cerrarSesion")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="shine hidden min-[1100px]:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold glow-gold hover:bg-primary-hover transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {t("nav.entrar")}
              </Link>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileOpen}
              className="min-[1100px]:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="pb-4">
            <input
              type="text"
              placeholder={t("nav.buscar")}
              className="w-full px-4 py-2.5 bg-secondary rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="min-[1100px]:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to ||
                (item.to !== "/" && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Shield className="w-5 h-5" />
                Admin
              </Link>
            )}
            <Link
              to="/asistente"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {t("nav.asistente")}
            </Link>

            {/* Mobile auth */}
            <div className="pt-2 border-t border-border mt-2">
              {user ? (
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  {t("nav.cerrarSesion")}
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  {t("nav.iniciarSesion")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
