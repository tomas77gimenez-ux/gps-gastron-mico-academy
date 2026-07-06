import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { CourseMaterial, PlanTier } from "@/lib/admin-types";
import { PLAN_TIERS } from "@/lib/admin-types";
import { Upload, Trash2, FileText, Download, Loader2, Crown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

function formatSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MaterialUpload({ courseId }: { courseId: string }) {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [requiredPlan, setRequiredPlan] = useState<PlanTier>("basico");

  async function loadMaterials() {
    const { data } = await supabase
      .from("course_materials")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    setMaterials((data as unknown as CourseMaterial[]) ?? []);
  }

  useEffect(() => { loadMaterials(); }, [courseId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "bin";
    const filePath = `${courseId}/${Date.now()}_${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from("course-content")
      .upload(filePath, file);

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("course-content").getPublicUrl(filePath);

    const { error: insertErr } = await supabase.from("course_materials").insert({
      course_id: courseId,
      title: file.name,
      file_url: urlData.publicUrl,
      file_type: ext,
      file_size: file.size,
      required_plan: requiredPlan,
    } as any);

    if (insertErr) setError(insertErr.message);

    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    loadMaterials();
  }

  async function handleDelete(mat: CourseMaterial) {
    if (!confirm(`¿Eliminar "${mat.title}"?`)) return;
    // Extract path from URL
    const urlParts = mat.file_url.split("/course-content/");
    if (urlParts[1]) {
      await supabase.storage.from("course-content").remove([urlParts[1]]);
    }
    await supabase.from("course_materials").delete().eq("id", mat.id);
    loadMaterials();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary" /> Materiales ({materials.length})
        </h4>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 p-0.5 rounded-md bg-secondary/50 text-xs">
            {PLAN_TIERS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setRequiredPlan(p.value)}
                className={`px-2 py-1 rounded inline-flex items-center gap-1 transition-all ${
                  requiredPlan === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
                title={`Nuevo material será ${p.label}`}
              >
                {p.value === "premium" ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                {p.label}
              </button>
            ))}
          </div>
          <input ref={fileRef} type="file" onChange={handleUpload} className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.jpg,.png,.mp3,.mp4" />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
            {uploading ? "Subiendo..." : "Subir Archivo"}
          </Button>
        </div>
      </div>

      {error && <p className="text-xs text-destructive mb-2">{error}</p>}

      <div className="space-y-2">
        {materials.map(mat => (
          <div key={mat.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mat.title}</p>
              <p className="text-xs text-muted-foreground">
                {mat.file_type.toUpperCase()} · {formatSize(mat.file_size)}
                {(mat.required_plan ?? "basico") === "premium" ? (
                  <span className="ml-2 text-primary inline-flex items-center gap-0.5"><Crown className="w-3 h-3" /> Premium</span>
                ) : (
                  <span className="ml-2 text-blue-300 inline-flex items-center gap-0.5"><Star className="w-3 h-3" /> Básico</span>
                )}
              </p>
            </div>
            <a href={mat.file_url} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded hover:bg-secondary"><Download className="w-3 h-3" /></a>
            <button onClick={() => handleDelete(mat)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {materials.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Sin materiales. Sube el primero.</p>
        )}
      </div>
    </div>
  );
}
