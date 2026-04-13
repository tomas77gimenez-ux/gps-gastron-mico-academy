import { Play, BookOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export interface CourseCardData {
  id: string;
  title: string;
  lessons: number;
  progress?: number; // 0-100
  thumbnail?: string;
  instructor: string;
  category: string;
}

interface CourseCardProps {
  course: CourseCardData;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ duration: 0.2 }}
      className="shrink-0 w-[260px] md:w-[280px] group"
    >
      <a href="/cursos" className="block">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-navy-light mb-3">
          {/* Thumbnail placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-navy-light to-navy flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-primary/40" />
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            </div>
          </div>

          {/* Progress bar */}
          {course.progress !== undefined && course.progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          )}
        </div>

        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
          {course.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {course.lessons} lecciones · {course.instructor}
        </p>
      </a>
    </motion.div>
  );
}
