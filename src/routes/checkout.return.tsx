import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/return")({
  component: CheckoutReturnPage,
  head: () => ({
    meta: [
      { title: "Pago Completado — GPS Gastronômico" },
      { name: "description", content: "Tu pago ha sido procesado exitosamente." },
    ],
  }),
});

function CheckoutReturnPage() {
  const sessionId = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get("session_id")
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold font-display mb-2">¡Pago completado!</h1>
        <p className="text-muted-foreground mb-6">
          Tu compra ha sido procesada exitosamente. Recibirás un email con los detalles.
        </p>
        {sessionId && (
          <p className="text-xs text-muted-foreground/60 mb-6 break-all">
            Referencia: {sessionId}
          </p>
        )}
        <Link to="/tienda">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
            Volver a Productos
          </Button>
        </Link>
      </div>
    </div>
  );
}
