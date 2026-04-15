import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseManager } from "@/components/admin/CourseManager";
import { Shield, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — GPS Gastronômico" },
      { name: "description", content: "Panel de administración de cursos y contenido." },
    ],
  }),
});

function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: currentUser.id,
          _role: "admin",
        });
        setIsAdmin(!!data);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const { data } = await supabase.rpc("has_role", {
          _user_id: currentUser.id,
          _role: "admin",
        });
        setIsAdmin(!!data);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) setLoginError(error.message);
    setLoginLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  // Not logged in — show login form
  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="w-4 h-4" /> Panel de Administración
            </div>
            <h1 className="text-2xl font-bold font-display">Acceso Admin</h1>
            <p className="text-muted-foreground text-sm mt-2">Inicia sesión con tu cuenta de administrador</p>
          </div>
          <form onSubmit={handleLogin} className="rounded-xl border border-border bg-card p-6 space-y-4">
            {loginError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-2 text-sm">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="admin@gpsgastronomico.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required />
            </div>
            <Button type="submit" className="w-full" disabled={loginLoading}>
              <LogIn className="w-4 h-4 mr-2" /> {loginLoading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 text-center">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-display">Acceso Denegado</h1>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            Tu cuenta no tiene permisos de administrador.
          </p>
          <Button variant="outline" onClick={handleLogout}>Cerrar Sesión</Button>
        </div>
      </div>
    );
  }

  // Admin panel
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
              <Shield className="w-3.5 h-3.5" /> Admin
            </div>
            <h1 className="text-2xl font-bold font-display">Gestión de Contenido</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Administra cursos, lecciones y materiales · {user.email}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>Cerrar Sesión</Button>
        </div>
        <CourseManager />
      </div>
    </div>
  );
}
