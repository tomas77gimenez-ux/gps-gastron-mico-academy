import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Course } from "@/lib/admin-types";
import { LessonManager } from "./LessonManager";
import { MaterialUpload } from "./MaterialUpload";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  GripVertical, BookOpen, Save, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "Gestión Financiera", "Procesos Operativos", "Marketing para Restaurantes",
  "Liderazgo y Equipo", "Sustentabilidad y Crecimiento", "General",
];
const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

function CourseForm({ course, onSave, onCancel }: {
  course?: Course; onSave: (data: Partial<Course>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    category: course?.category ?? CATEGORIES[0],
    instructor: course?.instructor ?? "Daniel Gimenez",
    level: course?.level ?? LEVELS[0],
    estimated_duration: course?.estimated_duration ?? "",
    thumbnail_url: course?.thumbnail_url ?? "",
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 className="font-display font-semibold text-lg">
        {course ? "Editar Curso" : "Nuevo Curso"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Título</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Nombre del curso" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3} className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Descripción del curso" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Categoría</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nivel</label>
          <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Instructor</label>
          <input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duración Estimada</label>
          <input value={form.estimated_duration} onChange={e => setForm(f => ({ ...f, estimated_duration: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="ej: 4 horas" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">URL Thumbnail</label>
          <input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="https://..." />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-4 h-4 mr-1" /> Cancelar</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.title.trim()}>
          <Save className="w-4 h-4 mr-1" /> Guardar
        </Button>
      </div>
    </div>
  );
}

export function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function loadCourses() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("courses")
      .select("*")
      .order("sort_order", { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setCourses((data as unknown as Course[]) ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { loadCourses(); }, []);

  async function handleCreate(form: Partial<Course>) {
    const { error: err } = await supabase.from("courses").insert({
      title: form.title!,
      description: form.description || null,
      category: form.category!,
      instructor: form.instructor!,
      level: form.level!,
      estimated_duration: form.estimated_duration || null,
      thumbnail_url: form.thumbnail_url || null,
      sort_order: courses.length,
    } as any);
    if (err) { setError(err.message); return; }
    setCreating(false);
    loadCourses();
  }

  async function handleUpdate(id: string, form: Partial<Course>) {
    const { error: err } = await supabase.from("courses").update({
      title: form.title,
      description: form.description || null,
      category: form.category,
      instructor: form.instructor,
      level: form.level,
      estimated_duration: form.estimated_duration || null,
      thumbnail_url: form.thumbnail_url || null,
    } as any).eq("id", id);
    if (err) { setError(err.message); return; }
    setEditing(null);
    loadCourses();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este curso y todas sus lecciones?")) return;
    const { error: err } = await supabase.from("courses").delete().eq("id", id);
    if (err) { setError(err.message); return; }
    loadCourses();
  }

  async function toggleStatus(course: Course) {
    const newStatus = course.status === "published" ? "draft" : "published";
    await supabase.from("courses").update({ status: newStatus } as any).eq("id", course.id);
    loadCourses();
  }

  if (loading) return <div className="text-center py-12 text-muted-foreground">Cargando cursos...</div>;

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm">
          {error}
          <p className="text-xs mt-1 opacity-70">Asegúrate de estar logueado como admin.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Cursos ({courses.length})
        </h2>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nuevo Curso
          </Button>
        )}
      </div>

      {creating && <CourseForm onSave={handleCreate} onCancel={() => setCreating(false)} />}

      <div className="space-y-3">
        {courses.map(course => (
          <div key={course.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {editing === course.id ? (
              <div className="p-4">
                <CourseForm course={course} onSave={(f) => handleUpdate(course.id, f)} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{course.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        course.status === "published" ? "bg-green-500/15 text-green-400" : "bg-yellow-500/15 text-yellow-400"
                      }`}>
                        {course.status === "published" ? "Publicado" : "Borrador"}
                      </span>
                      <span className="text-xs text-muted-foreground">{course.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{course.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleStatus(course)} className="p-2 rounded-lg hover:bg-secondary transition-colors" title={course.status === "published" ? "Despublicar" : "Publicar"}>
                      {course.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditing(course.id)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setExpanded(expanded === course.id ? null : course.id)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors">
                      {expanded === course.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {expanded === course.id && (
                  <div className="border-t border-border p-4 space-y-6 bg-secondary/20">
                    <LessonManager courseId={course.id} />
                    <MaterialUpload courseId={course.id} />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {courses.length === 0 && !creating && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            No hay cursos aún. Crea el primero.
          </p>
        )}
      </div>
    </div>
  );
}
