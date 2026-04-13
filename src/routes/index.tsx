import { createFileRoute } from "@tanstack/react-router";
import { HeroBanner } from "@/components/HeroBanner";
import { CourseRow } from "@/components/CourseRow";
import { featuredCourse, courseRows } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "GPS Gastronômico — Gestión · Procesos · Sustentabilidad" },
      { name: "description", content: "Plataforma de formación para profesionales gastronómicos. Cursos, herramientas y mentoría para transformar tu restaurante." },
      { property: "og:title", content: "GPS Gastronômico" },
      { property: "og:description", content: "Plataforma de formación para profesionales gastronómicos." },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <HeroBanner {...featuredCourse} />
        <div className="mt-10 space-y-2">
          {courseRows.map((row) => (
            <CourseRow key={row.title} title={row.title} courses={row.courses} />
          ))}
        </div>
      </div>
    </div>
  );
}
