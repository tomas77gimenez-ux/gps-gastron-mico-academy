import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Key, RefreshCw, Save, Check, AlertTriangle, Video, Loader2 } from "lucide-react";
import type { MatchPair, BunnyVideo } from "@/lib/bunny-match";

interface SyncResult {
  libraryId: string;
  totalVideos: number;
  matched: MatchPair[];
  unmatchedVideos: BunnyVideo[];
  ambiguous: BunnyVideo[];
  lessonsWithoutVideo: { id: string; title: string; course_title: string }[];
  lessons: { id: string; title: string; course_title: string }[];
}

async function callSync(body: Record<string, unknown>) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sesión expirada, vuelve a iniciar sesión.");
  const res = await fetch("/api/public/bunny-sync", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((payload as { error?: string }).error ?? `Error ${res.status}`);
  return payload;
}

export function BunnySync() {
  const [apiKey, setApiKey] = useState("");
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [manual, setManual] = useState<Record<string, string>>({});
  const [savingPairs, setSavingPairs] = useState(false);
  const [savedPairs, setSavedPairs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveKey() {
    setSavingKey(true);
    setError(null);
    try {
      await callSync({ action: "set_key", apiKey });
      setApiKey("");
      setKeySaved(true);
      setTimeout(() => setKeySaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la clave");
    }
    setSavingKey(false);
  }

  async function runSync() {
    setSyncing(true);
    setError(null);
    setSavedPairs(false);
    try {
      const data = (await callSync({ action: "sync" })) as SyncResult;
      setResult(data);
      setManual({});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al sincronizar");
    }
    setSyncing(false);
  }

  async function savePairs() {
    if (!result) return;
    const pairs = Object.entries(manual)
      .filter(([, target]) => !!target)
      .map(([guid, target]) => {
        const [lessonId, slot] = target.split("|");
        return { lessonId, slot: Number(slot) === 2 ? 2 : 1, guid };
      });
    if (pairs.length === 0) return;
    setSavingPairs(true);
    setError(null);
    try {
      await callSync({ action: "save", pairs });
      setSavedPairs(true);
      await runSync();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron guardar los enlaces");
    }
    setSavingPairs(false);
  }

  const pendingVideos = result ? [...result.ambiguous, ...result.unmatchedVideos] : [];

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-1">
          <Video className="w-4 h-4 text-primary" /> Sincronización con Bunny Stream
        </h3>
        <p className="text-xs text-muted-foreground">
          Busca los videos de la biblioteca y los asocia automáticamente a cada lección por nombre de archivo.
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1 flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-primary" /> Bunny API Key
        </label>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="off"
            className="flex-1 rounded-lg border border-input bg-secondary/50 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button size="sm" onClick={saveKey} disabled={savingKey || apiKey.trim().length < 8}>
            {keySaved ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
            {keySaved ? "Guardada" : savingKey ? "Guardando..." : "Guardar"}
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Bunny.net → Account → API Key. Se guarda solo en el servidor y nunca se muestra de nuevo.
        </p>
      </div>

      <Button size="sm" variant="outline" onClick={runSync} disabled={syncing}>
        {syncing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1" />}
        {syncing ? "Sincronizando..." : "Sincronizar videos de Bunny"}
      </Button>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {result && (
        <div className="space-y-4 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {result.totalVideos} videos en la biblioteca {result.libraryId} ·{" "}
            <span className="text-green-400">{result.matched.length} asociados</span> ·{" "}
            {pendingVideos.length} sin asociar
          </p>

          {result.matched.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold">Asociados automáticamente</h4>
              {result.matched.map((m) => (
                <div key={`${m.lessonId}-${m.slot}`} className="text-xs flex items-start gap-2 py-1">
                  <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                  <span className="flex-1">
                    <span className="font-medium">{m.lessonTitle}</span>
                    {m.slot === 2 && <span className="text-primary"> (video 2)</span>}
                    <span className="text-muted-foreground"> ← {m.videoTitle}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {pendingVideos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> Revisión manual
              </h4>
              {pendingVideos.map((v) => (
                <div key={v.guid} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs flex-1 truncate">{v.title || v.guid}</span>
                  <select
                    value={manual[v.guid] ?? ""}
                    onChange={(e) => setManual((m) => ({ ...m, [v.guid]: e.target.value }))}
                    className="rounded-lg border border-input bg-secondary/50 py-1.5 px-2 text-xs sm:w-80 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Sin asociar</option>
                    {result.lessons.map((l) => (
                      <option key={`${l.id}-1`} value={`${l.id}|1`}>
                        {l.course_title} · {l.title}
                      </option>
                    ))}
                    {result.lessons.map((l) => (
                      <option key={`${l.id}-2`} value={`${l.id}|2`}>
                        {l.course_title} · {l.title} (video 2)
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <Button size="sm" onClick={savePairs} disabled={savingPairs}>
                {savedPairs ? <Check className="w-4 h-4 mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                {savingPairs ? "Guardando..." : "Guardar asociaciones"}
              </Button>
            </div>
          )}

          {result.lessonsWithoutVideo.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-semibold">Lecciones sin video</h4>
              {result.lessonsWithoutVideo.map((l) => (
                <p key={l.id} className="text-xs text-muted-foreground">
                  {l.course_title} · {l.title}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}