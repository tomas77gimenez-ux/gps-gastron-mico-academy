import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Radial gold glow that follows the cursor inside the card. */
  glowFollow?: boolean;
  /** Subtle 3D tilt on hover (max 3deg). */
  tilt?: boolean;
}

export function GlassCard({ children, className, glowFollow = false, tilt = false }: GlassCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [rot, setRot] = useState({ x: 0, y: 0 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    if (glowFollow) setPos({ x, y });
    if (tilt) {
      setRot({
        x: ((y / r.height) * 2 - 1) * -3,
        y: ((x / r.width) * 2 - 1) * 3,
      });
    }
  }

  function onLeave() {
    setPos(null);
    setRot({ x: 0, y: 0 });
  }

  return (
    <div
      ref={ref}
      onMouseMove={glowFollow || tilt ? onMove : undefined}
      onMouseLeave={glowFollow || tilt ? onLeave : undefined}
      style={
        tilt
          ? {
              transform: `perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
              transformStyle: "preserve-3d",
            }
          : undefined
      }
      className={cn(
        "group relative overflow-hidden rounded-2xl glass transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:border-border-strong",
        className,
      )}
    >
      {glowFollow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: pos
              ? `radial-gradient(340px circle at ${pos.x}px ${pos.y}px, rgba(212,160,23,0.13), transparent 70%)`
              : undefined,
          }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
