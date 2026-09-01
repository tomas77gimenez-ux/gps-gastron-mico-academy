import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { DEFAULT_THEME, readPrefs, THEME_BOOTSTRAP_SCRIPT } from "@/lib/prefs";
import { GA_MEASUREMENT_ID, identifyUser, trackEvent, trackPageView } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { sendWelcomeIfNeeded } from "@/lib/email/send-welcome";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  // Read once per request/navigation and expose to every component, loader and
  // head() below via the router context.
  beforeLoad: () => ({ prefs: readPrefs() }),
  loader: ({ context }) => context.prefs,
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "color-scheme", content: loaderData?.theme ?? DEFAULT_THEME },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "referrer", content: "strict-origin-when-cross-origin" },
      { title: "GPS Gastronômico — Gestión · Procesos · Sustentabilidad" },
      { name: "description", content: "Plataforma de formación para profesionales gastronómicos." },
      { name: "author", content: "GPS Gastronômico" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GPS Gastronômico" },
      { property: "og:locale", content: "es_ES" },
      { name: "twitter:card", content: "summary" },
      { property: "og:title", content: "GPS Gastronômico — Gestión · Procesos · Sustentabilidad" },
      { name: "twitter:title", content: "GPS Gastronômico — Gestión · Procesos · Sustentabilidad" },
      { property: "og:description", content: "Plataforma de formación para profesionales gastronómicos." },
      { name: "twitter:description", content: "Plataforma de formación para profesionales gastronómicos." },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800&family=Figtree:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "GPS Gastronômico",
          url: "https://plataforma-test1.lovable.app",
          description:
            "Plataforma de formación, mentoría y herramientas de gestión para profesionales gastronómicos.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "GPS Gastronômico",
          url: "https://plataforma-test1.lovable.app",
        }),
      },
      ...(GA_MEASUREMENT_ID
        ? [
          {
            src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
            async: true,
          },
          {
            children: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}window.gtag = gtag;gtag('js', new Date());gtag('config', '${GA_MEASUREMENT_ID}');`,
          },
        ]
        : []),
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  // Language comes from the cookie on both sides of the render (server: request
  // header, client: document.cookie) so SSR markup and hydration agree.
  const { theme, lang } = readPrefs();

  return (
    // The theme class is owned by the inline bootstrap script below: it runs
    // before the first paint (cookie, else OS preference), so there is no flash.
    // React must not fight it — hence suppressHydrationWarning.
    <html
      lang={lang}
      className={theme === "dark" ? "dark" : undefined}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { prefs } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // SPA page_view: gtag only auto-reports the first load.
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      identifyUser(data.session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          identifyUser(session.user.id);
          trackEvent("login", {
            method: session.user.app_metadata?.provider ?? "email",
          });
          // Fire-and-forget; internally idempotent via profiles.welcomed_at.
          void sendWelcomeIfNeeded(session);
        }
        if (event === "SIGNED_OUT") {
          identifyUser(null);
        }
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <I18nProvider initialLang={prefs.lang}>
        <Navbar />
        <div key={pathname} className="animate-in fade-in duration-150">
          <Outlet />
        </div>
        <Footer />
      </I18nProvider>
    </ThemeProvider>
  );
}
