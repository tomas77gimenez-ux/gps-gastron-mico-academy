import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  description: string;
  instructor: string;
  category: string;
  imageUrl?: string;
}

export function HeroBanner({ title, description, instructor, category }: HeroBannerProps) {
  return (
    <div className="relative w-full h-[50vh] min-h-[400px] max-h-[550px] rounded-2xl overflow-hidden bg-card">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
      
      {/* Pattern background */}
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--primary) 45%, transparent) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
      </div>

      {/* Accent glow */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px] z-0" />

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-end p-8 md:p-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4 uppercase tracking-wider border border-primary/20">
            {category}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold font-display mb-3 leading-tight">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-2 line-clamp-2">
            {description}
          </p>
          <p className="text-muted-foreground text-sm mb-6">
            Por <span className="text-primary font-medium">{instructor}</span>
          </p>
          <div className="flex gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 rounded-xl glow-orange">
              <Play className="w-4 h-4 mr-2" />
              Reproducir
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-secondary rounded-xl">
              Más información
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
