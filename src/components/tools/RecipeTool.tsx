import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "sonner";
import {
  ClipboardList, Package, Plus, Trash2, Save, Loader2, Info, Pencil, X, ChefHat,
} from "lucide-react";
import { money2, num, pct, realCost, UNITS } from "@/lib/tools-format";
import { Callout, Field, KPI, NumberInput, Pill, ToolCard, ToolSectionTitle, inputClass } from "./ToolUI";
import { useI18n } from "@/lib/i18n";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  purchase_price: number;
  yield_factor_pct: number;
}
interface Dish {
  id: string;
  name: string;
  target_cmv_pct: number;
  current_menu_price: number | null;
}
interface DishIngredient {
  id: string;
  dish_id: string;
  ingredient_id: string;
  quantity: number;
}

type DraftLine = { ingredient_id: string; quantity: string };

export function RecipeTool() {
  const { t } = useI18n();
  const { user, isReady } = useAuthSession();
  const [tab, setTab] = useState<"banco" | "ficha">("banco");
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [allLines, setAllLines] = useState<DishIngredient[]>([]);

  // Formulario de ingrediente
  const [ingForm, setIngForm] = useState({ id: "", name: "", unit: "kg", price: "", yield: "100" });
  const [savingIng, setSavingIng] = useState(false);

  // Ficha del plato
  const [dishId, setDishId] = useState<string | null>(null);
  const [dishName, setDishName] = useState("");
  const [targetCmv, setTargetCmv] = useState("32");
  const [menuPrice, setMenuPrice] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [savingDish, setSavingDish] = useState(false);

  async function loadAll() {
    if (!user) return;
    setLoading(true);
    const [ing, dsh, dl] = await Promise.all([
      supabase.from("ingredients").select("*").eq("user_id", user.id).order("name"),
      supabase.from("dishes").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("dish_ingredients").select("*").eq("user_id", user.id),
    ]);
    setIngredients((ing.data ?? []) as Ingredient[]);
    setDishes((dsh.data ?? []) as Dish[]);
    setAllLines((dl.data ?? []) as DishIngredient[]);
    setLoading(false);
  }

  useEffect(() => {
    if (!isReady || !user) return;
    void loadAll();
  }, [isReady, user?.id]);

  const ingMap = useMemo(() => {
    const m = new Map<string, Ingredient>();
    for (const i of ingredients) m.set(i.id, i);
    return m;
  }, [ingredients]);

  function dishCost(id: string): number {
    return allLines
      .filter((l) => l.dish_id === id)
      .reduce((acc, l) => {
        const ing = ingMap.get(l.ingredient_id);
        if (!ing) return acc;
        return acc + realCost(Number(ing.purchase_price), Number(ing.yield_factor_pct)) * Number(l.quantity);
      }, 0);
  }

  async function saveIngredient() {
    if (!user || !ingForm.name.trim()) {
      toast.error(t("ficha.errNombreIng"));
      return;
    }
    setSavingIng(true);
    const payload = {
      user_id: user.id,
      name: ingForm.name.trim(),
      unit: ingForm.unit,
      purchase_price: num(ingForm.price),
      yield_factor_pct: num(ingForm.yield) || 100,
    };
    const { error } = ingForm.id
      ? await supabase.from("ingredients").update(payload).eq("id", ingForm.id)
      : await supabase.from("ingredients").insert(payload);
    setSavingIng(false);
    if (error) {
      toast.error(t("ficha.errGuardar"), { description: error.message });
      return;
    }
    toast.success(ingForm.id ? t("ficha.ingActualizado") : t("ficha.ingAgregado"));
    setIngForm({ id: "", name: "", unit: "kg", price: "", yield: "100" });
    void loadAll();
  }

  async function deleteIngredient(id: string) {
    const { error } = await supabase.from("ingredients").delete().eq("id", id);
    if (error) {
      toast.error(t("ficha.errEliminar"), { description: error.message });
      return;
    }
    void loadAll();
  }

  const draftCost = useMemo(
    () =>
      lines.reduce((acc, l) => {
        const ing = ingMap.get(l.ingredient_id);
        if (!ing) return acc;
        return acc + realCost(Number(ing.purchase_price), Number(ing.yield_factor_pct)) * num(l.quantity);
      }, 0),
    [lines, ingMap],
  );

  const target = Math.min(99.9, Math.max(1, num(targetCmv) || 32));
  const suggested = draftCost / (target / 100);
  const price = num(menuPrice);
  const realCmv = price > 0 ? (draftCost / price) * 100 : 0;
  const margin = price - draftCost;
  const profitable = price > 0 && realCmv <= target;

  function newDish() {
    setDishId(null);
    setDishName("");
    setTargetCmv("32");
    setMenuPrice("");
    setLines([]);
    setTab("ficha");
  }

  function editDish(d: Dish) {
    setDishId(d.id);
    setDishName(d.name);
    setTargetCmv(String(d.target_cmv_pct));
    setMenuPrice(d.current_menu_price === null ? "" : String(d.current_menu_price));
    setLines(
      allLines
        .filter((l) => l.dish_id === d.id)
        .map((l) => ({ ingredient_id: l.ingredient_id, quantity: String(l.quantity) })),
    );
    setTab("ficha");
  }

  async function saveDish() {
    if (!user || !dishName.trim()) {
      toast.error(t("ficha.errNombrePlato"));
      return;
    }
    setSavingDish(true);
    const payload = {
      user_id: user.id,
      name: dishName.trim(),
      target_cmv_pct: target,
      current_menu_price: menuPrice === "" ? null : num(menuPrice),
    };
    let id = dishId;
    if (id) {
      const { error } = await supabase.from("dishes").update(payload).eq("id", id);
      if (error) {
        setSavingDish(false);
        toast.error(t("ficha.errGuardar"), { description: error.message });
        return;
      }
      await supabase.from("dish_ingredients").delete().eq("dish_id", id);
    } else {
      const { data, error } = await supabase.from("dishes").insert(payload).select("id").single();
      if (error || !data) {
        setSavingDish(false);
        toast.error(t("ficha.errGuardar"), { description: error?.message });
        return;
      }
      id = data.id;
    }
    const valid = lines.filter((l) => l.ingredient_id && num(l.quantity) > 0);
    if (valid.length > 0) {
      await supabase.from("dish_ingredients").insert(
        valid.map((l) => ({
          user_id: user.id,
          dish_id: id!,
          ingredient_id: l.ingredient_id,
          quantity: num(l.quantity),
        })),
      );
    }
    setSavingDish(false);
    setDishId(id);
    toast.success(t("ficha.guardada"));
    void loadAll();
  }

  async function deleteDish(id: string) {
    const { error } = await supabase.from("dishes").delete().eq("id", id);
    if (error) {
      toast.error(t("ficha.errEliminar"), { description: error.message });
      return;
    }
    if (dishId === id) newDish();
    void loadAll();
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> {t("ficha.cargando")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {([
          { k: "banco", labelKey: "ficha.tabBanco", icon: Package },
          { k: "ficha", labelKey: "ficha.tabFicha", icon: ChefHat },
        ] as const).map((tb) => (
          <button
            key={tb.k}
            onClick={() => setTab(tb.k)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === tb.k ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <tb.icon className="w-4 h-4" /> {t(tb.labelKey)}
          </button>
        ))}
      </div>

      {tab === "banco" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ToolCard>
            <ToolSectionTitle icon={Package}>{ingForm.id ? t("ficha.editarIng") : t("ficha.nuevoIng")}</ToolSectionTitle>
            <div className="space-y-4">
              <Field label={t("ficha.nombre")}>
                <input
                  type="text"
                  value={ingForm.name}
                  onChange={(e) => setIngForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t("ficha.nombrePh")}
                  className={inputClass}
                />
              </Field>
              <Field label={t("ficha.unidad")}>
                <select
                  value={ingForm.unit}
                  onChange={(e) => setIngForm((f) => ({ ...f, unit: e.target.value }))}
                  className={inputClass}
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </Field>
              <Field label={t("ficha.precio")} hint={t("ficha.precioHint").replace("{unit}", ingForm.unit)}>
                <NumberInput value={ingForm.price} onChange={(v) => setIngForm((f) => ({ ...f, price: v }))} placeholder="0" min={0} />
              </Field>
              <Field label={t("ficha.rendimiento")}>
                <NumberInput value={ingForm.yield} onChange={(v) => setIngForm((f) => ({ ...f, yield: v }))} placeholder="100" min={1} />
              </Field>
              <Callout tone="primary">
                <span className="flex gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs">
                    {t("ficha.rendInfo")}
                  </span>
                </span>
              </Callout>
              <div className="flex gap-2">
                <button
                  onClick={saveIngredient}
                  disabled={savingIng}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {savingIng ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {ingForm.id ? t("ficha.actualizar") : t("ficha.agregar")}
                </button>
                {ingForm.id && (
                  <button
                    onClick={() => setIngForm({ id: "", name: "", unit: "kg", price: "", yield: "100" })}
                    className="px-3 py-2.5 rounded-lg bg-secondary text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </ToolCard>

          <div className="lg:col-span-2">
            <ToolCard className="p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">{t("ficha.thIngrediente")}</th>
                    <th className="text-left px-4 py-3 font-medium">{t("ficha.thUn")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("ficha.thPrecio")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("ficha.thRend")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("ficha.thCostoReal")}</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ingredients.map((i) => (
                    <tr key={i.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{i.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{i.unit}</td>
                      <td className="px-4 py-3 text-right">{money2(Number(i.purchase_price))}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{pct(Number(i.yield_factor_pct), 0)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-primary-text">
                        {money2(realCost(Number(i.purchase_price), Number(i.yield_factor_pct)))}
                        <span className="text-[10px] text-muted-foreground"> /{i.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() =>
                              setIngForm({
                                id: i.id,
                                name: i.name,
                                unit: i.unit,
                                price: String(i.purchase_price),
                                yield: String(i.yield_factor_pct),
                              })
                            }
                            className="p-1.5 rounded hover:bg-primary/10 text-primary-text transition-colors"
                            aria-label={t("ficha.editar")}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteIngredient(i.id)}
                            className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                            aria-label={t("ficha.eliminar")}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {ingredients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                        {t("ficha.sinIngredientes")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </ToolCard>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ToolCard>
              <div className="flex items-center justify-between mb-4">
                <ToolSectionTitle icon={ClipboardList}>{dishId ? t("ficha.editarFicha") : t("ficha.nuevaFicha")}</ToolSectionTitle>
                <button onClick={newDish} className="text-xs text-primary-text hover:underline">{t("ficha.nuevoPlato")}</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <Field label={t("ficha.nombrePlato")}>
                    <input
                      type="text"
                      value={dishName}
                      onChange={(e) => setDishName(e.target.value)}
                      placeholder={t("ficha.nombrePlatoPh")}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label={t("ficha.cmvObjetivo")}>
                  <NumberInput value={targetCmv} onChange={setTargetCmv} placeholder="32" min={1} />
                </Field>
                <Field label={t("ficha.precioActual")}>
                  <NumberInput value={menuPrice} onChange={setMenuPrice} placeholder="0" min={0} />
                </Field>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold">{t("ficha.ingredientesReceta")}</h4>
                  <button
                    onClick={() => setLines((l) => [...l, { ingredient_id: "", quantity: "" }])}
                    disabled={ingredients.length === 0}
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/70 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t("ficha.agregar")}
                  </button>
                </div>
                {ingredients.length === 0 && (
                  <Callout tone="warning">{t("ficha.cargaPrimero")}</Callout>
                )}
                <div className="space-y-2">
                  {lines.map((l, idx) => {
                    const ing = ingMap.get(l.ingredient_id);
                    const lineCost = ing
                      ? realCost(Number(ing.purchase_price), Number(ing.yield_factor_pct)) * num(l.quantity)
                      : 0;
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={l.ingredient_id}
                          onChange={(e) =>
                            setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, ingredient_id: e.target.value } : x)))
                          }
                          className={`${inputClass} flex-1`}
                        >
                          <option value="">{t("ficha.elegiIngrediente")}</option>
                          {ingredients.map((i) => (
                            <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                          ))}
                        </select>
                        <div className="w-28">
                          <NumberInput
                            value={l.quantity}
                            onChange={(v) => setLines((ls) => ls.map((x, i) => (i === idx ? { ...x, quantity: v } : x)))}
                            placeholder={ing ? ing.unit : t("ficha.cant")}
                            min={0}
                          />
                        </div>
                        <span className="w-24 text-right text-sm font-medium">{money2(lineCost)}</span>
                        <button
                          onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}
                          className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
                          aria-label={t("ficha.quitarIngrediente")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  {t("ficha.notaUnidad")}
                </p>
              </div>

              <button
                onClick={saveDish}
                disabled={savingDish}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {savingDish ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t("ficha.guardarFicha")}
              </button>
            </ToolCard>

            <ToolCard className="p-0 overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h4 className="font-display font-semibold">{t("ficha.fichasGuardadas")}</h4>
              </div>
              <div className="divide-y divide-border">
                {dishes.map((d) => {
                  const cost = dishCost(d.id);
                  const p = d.current_menu_price === null ? 0 : Number(d.current_menu_price);
                  const cmv = p > 0 ? (cost / p) * 100 : 0;
                  const ok = p > 0 && cmv <= Number(d.target_cmv_pct);
                  return (
                    <div key={d.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("ficha.costoLinea").replace("{cost}", money2(cost))}{p > 0 ? t("ficha.precioCmv").replace("{price}", money2(p)).replace("{cmv}", pct(cmv)) : t("ficha.sinPrecio")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {p > 0 && <Pill tone={ok ? "success" : "danger"}>{ok ? t("ficha.platoRentable") : t("ficha.cmvAlto")}</Pill>}
                        <button onClick={() => editDish(d)} className="p-1.5 rounded hover:bg-primary/10 text-primary-text transition-colors" aria-label={t("ficha.editarFicha")}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteDish(d.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors" aria-label={t("ficha.eliminarFicha")}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {dishes.length === 0 && (
                  <p className="px-5 py-10 text-center text-muted-foreground text-sm">{t("ficha.sinFichas")}</p>
                )}
              </div>
            </ToolCard>
          </div>

          <div className="space-y-4">
            <KPI title={t("ficha.costoTotal")} value={money2(draftCost)} tone="primary" />
            <KPI title={t("ficha.precioSugerido")} value={money2(suggested)} subtitle={t("ficha.conCmvObjetivo").replace("{pct}", pct(target))} tone="success" />
            {price > 0 && (
              <>
                <KPI title={t("ficha.cmvReal")} value={pct(realCmv)} tone={profitable ? "success" : "danger"} />
                <KPI title={t("ficha.margenPlato")} value={money2(margin)} tone={margin > 0 ? "success" : "danger"} />
                <Callout tone={profitable ? "success" : "danger"}>
                  {profitable ? t("ficha.platoRentable") : t("ficha.cmvAltoRevisa")}
                </Callout>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
