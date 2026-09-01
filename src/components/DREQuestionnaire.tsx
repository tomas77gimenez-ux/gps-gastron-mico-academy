import { useState } from "react";
import { questionnaireSteps, type DREData, type QuestionField } from "@/lib/dre-questions";
import { ChevronRight, ChevronLeft, CheckCircle, Info, Plus, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { dreT } from "@/lib/dre-i18n";

function CurrencyInput({ field, value, onChange }: { field: QuestionField; value: number; onChange: (v: number) => void }) {
  const { lang } = useI18n();
  const label = dreT(`field.${field.id}`, lang);
  const helpText = field.helpText ? dreT(`field.${field.id}.help`, lang) : undefined;
  const [display, setDisplay] = useState(value > 0 ? value.toString() : "");

  function handleChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setDisplay(cleaned);
    const num = parseFloat(cleaned);
    onChange(isNaN(num) ? 0 : num);
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <div className="relative">
        {field.type === "currency" && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={display}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          className={`w-full rounded-lg border border-input bg-secondary/50 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
            field.type === "currency" ? "pl-7 pr-3" : "px-3"
          }`}
        />
      </div>
      {helpText && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Info className="w-3 h-3" /> {helpText}
        </p>
      )}
    </div>
  );
}

interface CustomField {
  id: string;
  label: string;
}

function CustomFieldRow({ customField, value, onChangeLabel, onChangeValue, onRemove }: {
  customField: CustomField;
  value: number;
  onChangeLabel: (label: string) => void;
  onChangeValue: (v: number) => void;
  onRemove: () => void;
}) {
  const { lang } = useI18n();
  const [display, setDisplay] = useState(value > 0 ? value.toString() : "");

  function handleChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setDisplay(cleaned);
    const num = parseFloat(cleaned);
    onChangeValue(isNaN(num) ? 0 : num);
  }

  return (
    <div className="col-span-1 sm:col-span-2 flex items-start gap-2">
      <div className="flex-1">
        <input
          type="text"
          value={customField.label}
          onChange={(e) => onChangeLabel(e.target.value.slice(0, 100))}
          placeholder={dreT("dre.nombreConcepto", lang)}
          className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-1"
        />
      </div>
      <div className="w-40">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={display}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-input bg-secondary/50 py-2.5 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
      <button
        onClick={onRemove}
        className="mt-1.5 p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function DREQuestionnaire({
  onComplete,
  initialData,
  submitLabelKey,
}: {
  onComplete: (data: DREData) => void;
  initialData?: DREData;
  submitLabelKey?: string;
}) {
  const { lang } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DREData>(initialData ?? {});
  // Track custom fields per section: { [sectionId]: CustomField[] }
  const [customFields, setCustomFields] = useState<Record<string, CustomField[]>>({});

  const step = questionnaireSteps[currentStep];
  const isLast = currentStep === questionnaireSteps.length - 1;
  const isFirst = currentStep === 0;

  function updateField(id: string, value: number) {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }

  function addCustomField(sectionId: string) {
    const id = `custom_${sectionId}_${Date.now()}`;
    setCustomFields((prev) => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), { id, label: "" }],
    }));
  }

  function removeCustomField(sectionId: string, fieldId: string) {
    setCustomFields((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter((f) => f.id !== fieldId),
    }));
    setFormData((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }

  function updateCustomFieldLabel(sectionId: string, fieldId: string, label: string) {
    setCustomFields((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).map((f) =>
        f.id === fieldId ? { ...f, label } : f
      ),
    }));
  }

  function next() {
    if (isLast) {
      onComplete(formData);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function prev() {
    if (!isFirst) setCurrentStep((s) => s - 1);
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {questionnaireSteps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(i)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === currentStep
                ? "bg-primary text-primary-foreground"
                : i < currentStep
                ? "bg-primary/20 text-primary-text"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {i < currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{dreT(`step.${s.id}.title`, lang)}</span>
          </button>
        ))}
      </div>

      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-display">{dreT(`step.${step.id}.title`, lang)}</h2>
        <p className="text-muted-foreground text-sm mt-1">{dreT(`step.${step.id}.subtitle`, lang)}</p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {step.sections.map((section) => {
          const sectionCustomFields = customFields[section.id] || [];
          return (
            <div key={section.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{dreT(`section.${section.id}.title`, lang)}</h3>
                    <p className="text-xs text-muted-foreground">{dreT(`section.${section.id}.desc`, lang)}</p>
                  </div>
                </div>
                {section.referenceRange && (
                  <span className="text-xs bg-primary/10 text-primary-text px-2 py-1 rounded-full">
                    {dreT("dre.ref", lang)} {section.referenceRange}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => (
                  <CurrencyInput
                    key={field.id}
                    field={field}
                    value={formData[field.id] || 0}
                    onChange={(v) => updateField(field.id, v)}
                  />
                ))}
                {/* Custom fields */}
                {sectionCustomFields.map((cf) => (
                  <CustomFieldRow
                    key={cf.id}
                    customField={cf}
                    value={formData[cf.id] || 0}
                    onChangeLabel={(label) => updateCustomFieldLabel(section.id, cf.id, label)}
                    onChangeValue={(v) => updateField(cf.id, v)}
                    onRemove={() => removeCustomField(section.id, cf.id)}
                  />
                ))}
              </div>
              {/* Add another button */}
              <button
                onClick={() => addCustomField(section.id)}
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-primary-text hover:border-primary/40 transition-colors w-full justify-center"
              >
                <Plus className="w-4 h-4" /> {dreT("dre.otro", lang)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prev}
          disabled={isFirst}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-sm font-medium disabled:opacity-30 hover:bg-secondary/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> {dreT("dre.anterior", lang)}
        </button>
        <button
          onClick={next}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-orange"
        >
          {isLast ? dreT(submitLabelKey ?? "dre.verDashboard", lang) : dreT("dre.siguiente", lang)} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
