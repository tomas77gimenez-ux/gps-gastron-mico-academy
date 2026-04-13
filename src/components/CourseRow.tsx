import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CourseCard, type CourseCardData } from "./CourseCard";

interface CourseRowProps {
  title: string;
  courses: CourseCardData[];
}

export function CourseRow({ title, courses }: CourseRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold font-display">{title}</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
