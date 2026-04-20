import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lesson } from "@/lib/admin-types";
import { Plus, Pencil, Trash2, Save, X, Video, FileText, Headphones, GripVertical, Upload, Loader2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "ebook", label: "Ebook", icon: FileText },
  { value: "audio", label: "Audio", icon: Headphones },
  { value: "material", label: "Material", icon: FileText },
];

function LessonForm({ lesson, onSave, onCancel }: {
  lesson?: Lesson; onSave: (data: Partial<Lesson>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: lesson?.title ?? "",
    description: lesson?.description ?? "",
    video_url: lesson?.video_url ?? "",
    content_type: lesson?.content_type ?? "video",
    duration: lesson?.duration ?? "",
    is_free: lesson?.is_free ?? false,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(form.video_url?.startsWith("http") ? "url" : "upload");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr(null);
    const path = `videos/${Date.now()}_${file.name.replace(/[^a-z0-9.\-_]/gi, "_")}`;
    const { error: upErr } = await supabase.storage.from("course-content").upload(path, file, { upsert: false });
    if (upErr) {
      setUploadErr(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("course-content").getPublicUrl(path);
    setForm(f => ({ ...f, video_url: data.publicUrl }));
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1">Título</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Nombre de la lección" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1">Descripción</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={2} className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Tipo</label>
          <select value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
            {CONTENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Duración</label>
          <input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="ej: 15 min" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium mb-1">Contenido del Video</label>
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setMode("upload")}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${mode === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Upload className="w-3 h-3" /> Subir archivo
            </button>
            <button type="button" onClick={() => setMode("url")}
              className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${mode === "url" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Link2 className="w-3 h-3" /> URL externa
            </button>
          </div>
          {mode === "upload" ? (
            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="hidden" />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full">
                {uploading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Subiendo...</> : <><Upload className="w-3 h-3 mr-1" /> Seleccionar video (mp4, mov, webm)</>}
              </Button>
              {form.video_url && (
                <p className="text-xs text-green-400 truncate">✓ {form.video_url.split("/").pop()}</p>
              )}
              {uploadErr && <p className="text-xs text-destructive">{uploadErr}</p>}
            </div>
          ) : (
            <input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
              className="w-full rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://youtube.com/... · vimeo · hotmart" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_free} onChange={e => setForm(f => ({ ...f, is_free: e.target.checked }))}
            className="rounded border-input" id="is-free" />
          <label htmlFor="is-free" className="text-xs">Lección gratuita (preview)</label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}><X className="w-3 h-3 mr-1" /> Cancelar</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.title.trim()}>
          <Save className="w-3 h-3 mr-1" /> Guardar
        </Button>
      </div>
    </div>
  );
}

export function LessonManager({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadLessons() {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });
    if (err) setError(err.message);
    else setLessons((data as unknown as Lesson[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { loadLessons(); }, [courseId]);

  async function handleCreate(form: Partial<Lesson>) {
    const { error: err } = await supabase.from("lessons").insert({
      course_id: courseId,
      title: form.title!,
      description: form.description || null,
      video_url: form.video_url || null,
      content_type: form.content_type!,
      duration: form.duration || null,
      is_free: form.is_free ?? false,
      sort_order: lessons.length,
    } as any);
    if (err) { setError(err.message); return; }
    setCreating(false);
    loadLessons();
  }

  async function handleUpdate(id: string, form: Partial<Lesson>) {
    const { error: err } = await supabase.from("lessons").update({
      title: form.title,
      description: form.description || null,
      video_url: form.video_url || null,
      content_type: form.content_type,
      duration: form.duration || null,
      is_free: form.is_free,
    } as any).eq("id", id);
    if (err) { setError(err.message); return; }
    setEditing(null);
    loadLessons();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta lección?")) return;
    await supabase.from("lessons").delete().eq("id", id);
    loadLessons();
  }

  if (loading) return <p className="text-xs text-muted-foreground">Cargando lecciones...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <Video className="w-4 h-4 text-primary" /> Lecciones ({lessons.length})
        </h4>
        {!creating && (
          <Button variant="outline" size="sm" onClick={() => setCreating(true)}>
            <Plus className="w-3 h-3 mr-1" /> Agregar Lección
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-destructive mb-2">{error}</p>}

      {creating && <div className="mb-3"><LessonForm onSave={handleCreate} onCancel={() => setCreating(false)} /></div>}

      <div className="space-y-2">
        {lessons.map((lesson, i) => (
          <div key={lesson.id}>
            {editing === lesson.id ? (
              <LessonForm lesson={lesson} onSave={f => handleUpdate(lesson.id, f)} onCancel={() => setEditing(null)} />
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-card/50 p-3">
                <GripVertical className="w-3 h-3 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                {(() => {
                  const CT = CONTENT_TYPES.find(t => t.value === lesson.content_type);
                  const Icon = CT?.icon ?? FileText;
                  return <Icon className="w-4 h-4 text-primary shrink-0" />;
                })()}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.duration ?? "—"} · {lesson.content_type}
                    {lesson.is_free && <span className="ml-2 text-green-400">Gratis</span>}
                  </p>
                </div>
                <button onClick={() => setEditing(lesson.id)} className="p-1.5 rounded hover:bg-secondary"><Pencil className="w-3 h-3" /></button>
                <button onClick={() => handleDelete(lesson.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>
              </div>
            )}
          </div>
        ))}
        {lessons.length === 0 && !creating && (
          <p className="text-xs text-muted-foreground text-center py-4">Sin lecciones. Agrega la primera.</p>
        )}
      </div>
    </div>
  );
}
