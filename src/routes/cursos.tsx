import { createFileRoute } from "@tanstack/react-router";
import { CourseRow } from "@/components/CourseRow";
import { courseRows } from "@/lib/mock-data";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/cursos")({
  component: CursosPage,
  head: () => ({
    meta: [
      { title: "Cursos — GPS Gastronômico" },
      { name: "description", content: "Explora todos nuestros cursos de gestión, operaciones, marketing y liderazgo gastronómico." },
    ],
  }),
});

function CursosPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl font-bold font-display mb-8">{t("cursos.titulo")}</h1>
        <div className="space-y-2">
          {courseRows.slice(1).map((row) => (
            <CourseRow key={row.title} title={row.title} courses={row.courses} />
          ))}
        </div>
      </div>
    </div>
  );
}
