import { Loader2, Lock, Video } from "lucide-react";
import { useProEmbedUrl } from "@/lib/pro";

interface Props {
  kind: "recording" | "case";
  id: string;
  title: string;
}

/** Reproductor Bunny con URL firmada en el servidor (mismo flujo que las clases). */
export function ProVideoPlayer({ kind, id, title }: Props) {
  const { url, loading, forbidden } = useProEmbedUrl(kind, id);

  if (loading) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-border bg-secondary/40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 text-center">
        <Lock className="h-6 w-6 text-primary" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">Este contenido es exclusivo de Academy Pro.</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 text-center">
        <Video className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">Todavía no hay video para esta sesión.</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      <iframe
        src={url}
        title={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  );
}
