import { useState } from "react";
import { questionnaireSteps, type DREData, type QuestionField } from "@/lib/dre-questions";
import { ChevronRight, ChevronLeft, CheckCircle, Info } from "lucide-react";

function CurrencyInput({ field, value, onChange }: { field: QuestionField; value: number; onChange: (v: number) => void }) {
  const [display, setDisplay] = useState(value > 0 ? value.toString() : "");

  function handleChange(raw: string) {
    const cleaned = raw.replace(/[^0-9.]/g, "");
    setDisplay(cleaned);
    const num = parseFloat(cleaned);
    onChange(isNaN(num) ? 0 : num);
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{field.label}</label>
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
      {field.helpText && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <Info className="w-3 h-3" /> {field.helpText}
        </p>
      )}
    </div>
  );
}

export function DREQuestionnaire({ onComplete }: { onComplete: (data: DREData) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DREData>({});

  const step = questionnaireSteps[currentStep];
  const isLast = currentStep === questionnaireSteps.length - 1;
  const isFirst = currentStep === 0;

  function updateField(id: string, value: number) {
    setFormData((prev) => ({ ...prev, [id]: value }));
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
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {i < currentStep ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Step Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-display">{step.title}</h2>
        <p className="text-muted-foreground text-sm mt-1">{step.subtitle}</p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {step.sections.map((section) => (
          <div key={section.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <div>
                  <h3 className="font-semibold text-sm">{section.title}</h3>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
              {section.referenceRange && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  Ref: {section.referenceRange}
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
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={prev}
          disabled={isFirst}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-sm font-medium disabled:opacity-30 hover:bg-secondary/80 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>
        <button
          onClick={next}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors glow-orange"
        >
          {isLast ? "Ver Dashboard" : "Siguiente"} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
