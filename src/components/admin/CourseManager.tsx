import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Course, PILLARS } from "@/lib/admin-types";
import { LessonManager } from "./LessonManager";
import { MaterialUpload } from "./MaterialUpload";
import { useBunnyLibraryId, saveBunnyLibraryId } from "@/lib/bunny";
import { BunnySync } from "./BunnySync";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
  GripVertical, BookOpen, Save, X, Compass, Radio, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

function BunnySettings() {
  const { libraryId, loading, setLibraryId } = useBunnyLibraryId();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    try {
      await saveBunnyLibraryId(libraryId);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setErr(e?.message ?? "No se pudo guardar");
    }
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-1">
        <Radio className="w-4 h-4 text-primary" /> Bunny Library ID
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Configuración global del reproductor. Todas las clases usan este Library ID junto al Video ID de cada lección.
      </p>
      <div className="flex items-center gap-2">
        <input
          value={libraryId}
          onChange={e => setLibraryId(e.target.value)}
          disabled={loading}
          className="flex-1 rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="ej: 412345"
        />
        <Button size="sm" onClick={save} disabled={saving || loading}>
          {saved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          {saved ? "Guardado" : saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
      {err && <p className="text-xs text-destructive mt-2">{err}</p>}
    </div>
  );
}

function CourseForm({ course, onSave, onCancel }: {
  course?: Course; onSave: (data: Partial<Course>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: course?.title ?? "",
    description: course?.description ?? "",
    methodology: course?.methodology ?? "gps",
    pillar_order: course?.pillar_order ?? 1,
    module_number: course?.module_number ?? 1,
    category: course?.category ?? PILLARS[0].name,
    instructor: course?.instructor ?? "Daniel Gimenez",
    level: course?.level ?? LEVELS[0],
    estimated_duration: course?.estimated_duration ?? "",
    thumbnail_url: course?.thumbnail_url ?? "",
  });

  function setPillar(order: number) {
    const p = PILLARS.find(p => p.order === order)!;
    setForm(f => ({ ...f, pillar_order: order, category: p.name }));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h3 className="font-display font-semibold text-lg">
        {course ? "Editar Curso" : "Nuevo Curso"}
      </h3>

      <div className="flex gap-2 p-1 rounded-lg bg-secondary/50 w-fit">
        <button type="button" onClick={() => setForm(f => ({ ...f, methodology: "gps" }))}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${form.methodology === "gps" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          <Compass className="w-3 h-3 inline mr-1" /> Mentoría · Método GPS
        </button>
        <button type="button" onClick={() => setForm(f => ({ ...f, methodology: "general" }))}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${form.methodology === "general" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
          Catálogo general
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Título</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Nombre del módulo (ej: MÓDULO 1 · DRE)" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3} className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>

        {form.methodology === "gps" ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Pilar</label>
              <select value={form.pillar_order} onChange={e => setPillar(Number(e.target.value))}
                className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                {PILLARS.map(p => <option key={p.order} value={p.order}>{p.order}. {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nº Módulo</label>
              <input type="number" min={1} max={9} value={form.module_number}
                onChange={e => setForm(f => ({ ...f, module_number: Number(e.target.value) }))}
                className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        )}

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
          <label className="block text-sm font-medium mb-1">Portada del curso</label>
          <div className="flex gap-3">
            <div className="w-40 shrink-0 aspect-video rounded-lg overflow-hidden border border-border/50 bg-secondary">
              {form.thumbnail_url ? (
                <img src={form.thumbnail_url} alt="Portada" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-card to-secondary flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary/30" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://... (URL Thumbnail)" />
              <input ref={coverRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleCoverUpload} />
              <Button type="button" variant="outline" size="sm" disabled={coverUploading} onClick={() => coverRef.current?.click()}>
                <Upload className="w-4 h-4 mr-1" />
                {coverUploading ? "Subiendo..." : "Subir imagen"}
              </Button>
              <p className="text-xs text-muted-foreground">PNG, JPG o WEBP · máx. 5MB · ideal 16:9 (1280×720)</p>
            </div>
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
  const [filter, setFilter] = useState<"gps" | "general">("gps");

  async function loadCourses() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("courses")
      .select("*")
      .order("methodology", { ascending: true })
      .order("pillar_order", { ascending: true, nullsFirst: false })
      .order("module_number", { ascending: true, nullsFirst: false })
      .order("sort_order", { ascending: true });
    if (err) setError(err.message);
    else setCourses((data as unknown as Course[]) ?? []);
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
      methodology: form.methodology ?? "gps",
      pillar_order: form.methodology === "general" ? null : form.pillar_order,
      module_number: form.methodology === "general" ? null : form.module_number,
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
      methodology: form.methodology,
      pillar_order: form.methodology === "general" ? null : form.pillar_order,
      module_number: form.methodology === "general" ? null : form.module_number,
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

  const filtered = courses.filter(c => c.methodology === filter);

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <BunnySettings />
      <BunnySync />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 p-1 rounded-lg bg-secondary/50">
          <button onClick={() => setFilter("gps")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === "gps" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            <Compass className="w-3 h-3 inline mr-1" /> Mentoría
          </button>
          <button onClick={() => setFilter("general")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filter === "general" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
            Catálogo general
          </button>
        </div>
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> {filtered.length} {filter === "gps" ? "módulos" : "cursos"}
        </h2>
        {!creating && (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-1" /> {filter === "gps" ? "Nuevo Módulo" : "Nuevo Curso"}
          </Button>
        )}
      </div>

      {creating && <CourseForm onSave={handleCreate} onCancel={() => setCreating(false)} />}

      <div className="space-y-3">
        {filtered.map(course => (
          <div key={course.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {editing === course.id ? (
              <div className="p-4">
                <CourseForm course={course} onSave={(f) => handleUpdate(course.id, f)} onCancel={() => setEditing(null)} />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4">
                  <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                  {course.methodology === "gps" && (
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center">
                      <span className="text-[9px] leading-none opacity-70">P{course.pillar_order}</span>
                      <span className="text-sm font-bold leading-none">M{course.module_number}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
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
                    <button onClick={() => toggleStatus(course)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
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
        {filtered.length === 0 && !creating && (
          <p className="text-center py-8 text-muted-foreground text-sm">
            Sin {filter === "gps" ? "módulos" : "cursos"} aún. Crea el primero.
          </p>
        )}
      </div>
    </div>
  );
}