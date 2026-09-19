import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectDelimiter, parseDelimited, parseMappedNumber } from "../src/data/csv.mjs";
import { calculateAnnualGrossSalary } from "../src/statistics/annual-salary.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: {
    input: { type: "string" },
    mapping: { type: "string" },
    output: { type: "string" }
  }
});
if (!values.input) {
  throw new Error("Falta --input con el fichero tabulado oficial extraido.");
}

const mappingPath = path.resolve(values.mapping ?? path.join(root, "data", "sources", "ine-ees-2022.mapping.json"));
const output = path.resolve(values.output ?? path.join(root, "data", "work", "ine-ees-2022", "canonical.ndjson"));
const mapping = JSON.parse(await readFile(mappingPath, "utf8"));
if (mapping.status !== "approved") {
  throw new Error("El mapeo no esta aprobado.");
}

const fieldColumns = {
  weight: mapping.columns?.weight,
  sex: mapping.columns?.sex,
  ageBand: mapping.columns?.ageBand,
  workingTime: mapping.columns?.workingTime,
  workplaceRegion: mapping.columns?.workplaceRegion,
  relationMonths: mapping.salaryFormula?.relationMonths,
  relationDays: mapping.salaryFormula?.relationDays,
  unpaidSpecialDays: mapping.salaryFormula?.unpaidSpecialDays,
  temporaryDisabilityDays: mapping.salaryFormula?.temporaryDisabilityDays
};
const salaryComponents = mapping.salaryFormula?.components ?? [];
for (const [key, column] of Object.entries(fieldColumns)) {
  if (!column) {
    throw new Error(`Falta la columna ${key} en el mapeo.`);
  }
}
if (salaryComponents.length === 0) {
  throw new Error("Faltan los componentes del salario anual en el mapeo.");
}

const text = await readFile(path.resolve(values.input), "utf8");
const delimiter = mapping.delimiter ?? detectDelimiter(text);
const rows = parseDelimited(text, delimiter);
const headers = rows.shift().map((header) => header.trim());
const requiredSourceColumns = [...Object.values(fieldColumns), ...salaryComponents];
const indexes = Object.fromEntries(requiredSourceColumns.map((column) => {
  const index = headers.indexOf(column);
  if (index < 0) {
    throw new Error(`La columna mapeada ${column} no existe en el fichero oficial.`);
  }
  return [column, index];
}));

function number(row, sourceColumn) {
  return parseMappedNumber(row[indexes[sourceColumn]], mapping.numberFormat);
}

function codedValue(group, rawValue, rowNumber) {
  const normalized = String(rawValue ?? "").trim();
  for (const [canonical, sourceValues] of Object.entries(mapping.values[group] ?? {})) {
    if (sourceValues.map(String).includes(normalized)) {
      return canonical;
    }
  }
  throw new Error(`Fila ${rowNumber}: codigo desconocido en ${group}: ${JSON.stringify(normalized)}.`);
}

function annualGrossSalary(row, rowNumber) {
  const rawValues = salaryComponents.map((column) => number(row, column));
  const relationMonths = number(row, fieldColumns.relationMonths);
  const relationDays = number(row, fieldColumns.relationDays);
  const unpaidSpecialDays = number(row, fieldColumns.unpaidSpecialDays);
  const temporaryDisabilityDays = number(row, fieldColumns.temporaryDisabilityDays);
  try {
    return calculateAnnualGrossSalary({
      components: rawValues,
      relationMonths,
      relationDays,
      unpaidSpecialDays,
      temporaryDisabilityDays
    });
  } catch (error) {
    throw new Error(`Fila ${rowNumber}: ${error.message}`);
  }
}

const outputLines = [];
for (let index = 0; index < rows.length; index += 1) {
  const rowNumber = index + 2;
  const row = rows[index];
  const weight = number(row, fieldColumns.weight);
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error(`Fila ${rowNumber}: ponderacion invalida.`);
  }
  const workingTime = codedValue("workingTime", row[indexes[fieldColumns.workingTime]], rowNumber);
  const record = {
    annualGrossSalary: annualGrossSalary(row, rowNumber),
    weight,
    sex: codedValue("sex", row[indexes[fieldColumns.sex]], rowNumber),
    ageBand: codedValue("ageBand", row[indexes[fieldColumns.ageBand]], rowNumber),
    workplaceRegion: codedValue("workplaceRegion", row[indexes[fieldColumns.workplaceRegion]], rowNumber),
    fullTime: workingTime === "full_time"
  };
  outputLines.push(JSON.stringify(record));
}

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${outputLines.join("\n")}\n`, { flag: "wx" });
console.log(`Normalizados ${outputLines.length} registros en ${output}.`);

