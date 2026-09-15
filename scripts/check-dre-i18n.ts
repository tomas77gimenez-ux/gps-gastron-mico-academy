/* Verifica que toda clave usada por la herramienta de DRE exista en es, en y pt. */
import { questionnaireSteps, OPTIONAL_SOURCE_KINDS, FIXED_SOURCES } from "../src/lib/dre-questions";
import { hasDreKey } from "../src/lib/dre-i18n";

const required = new Set<string>();

for (const step of questionnaireSteps) {
  required.add(`step.${step.id}.title`);
  required.add(`step.${step.id}.subtitle`);
  if (step.help) required.add(`step.${step.id}.help`);
  for (const section of step.sections) {
    required.add(`section.${section.id}.title`);
    required.add(`section.${section.id}.desc`);
    for (const g of section.groups ?? []) required.add(`group.${g}`);
    for (const f of section.fields) {
      required.add(`field.${f.id}`);
      if (f.help) required.add(`field.${f.id}.help`);
    }
  }
}

for (const kind of [...FIXED_SOURCES, ...OPTIONAL_SOURCE_KINDS]) {
  required.add(`section.${kind}.title`);
  required.add(`section.${kind}.desc`);
  required.add(`channel.${kind}`);
}

// Plantillas de las fuentes opcionales y su nombre por defecto.
required.add("field.net_sales.source");
required.add("field.cmv.source");
required.add("dre.fuenteSinNombre");

// Estados usados en dre-questions.ts.
for (const s of [
  "status.underControl",
  "status.above",
  "status.reviewExpense",
  "status.checkData",
  "status.onTarget",
  "status.belowTarget",
  "status.investLittle",
  "status.checkReturn",
  "status.loss",
  "status.covered",
  "status.notCovered",
]) {
  required.add(s);
}

// Categorías de gasto mostradas en los resultados.
for (const step of questionnaireSteps) {
  if (step.id === "operating" || step.id === "operating_more") {
    for (const section of step.sections) required.add(`expense.${section.id}`);
  }
}

const missing = [...required].filter((k) => !hasDreKey(k)).sort();

if (missing.length > 0) {
  console.error(`Faltan ${missing.length} claves en dre-i18n.ts:`);
  for (const k of missing) console.error(` - ${k}`);
  process.exit(1);
}

console.log(`OK: ${required.size} claves de DRE presentes en es, en y pt.`);
