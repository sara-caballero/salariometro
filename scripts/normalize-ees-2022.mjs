import { mkdir, readFile, writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectDelimiter, parseDelimited, parseMappedNumber } from "../src/data/csv.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: {
    input: { type: "string" },
    mapping: { type: "string" },
    output: { type: "string" }
  }
});
if (!values.input) {
  throw new Error("Falta --input con el CSV oficial extraido.");
}

const mappingPath = path.resolve(values.mapping ?? path.join(root, "data", "sources", "ine-ees-2022.mapping.json"));
const output = path.resolve(values.output ?? path.join(root, "data", "work", "ine-ees-2022", "canonical.ndjson"));
const mapping = JSON.parse(await readFile(mappingPath, "utf8"));
if (mapping.status !== "approved") {
  throw new Error("El mapeo no esta aprobado. Debe completarse contra el diseno de registro oficial.");
}

const requiredColumns = ["annualGrossSalary", "weight", "sex", "ageBand", "workingTime"];
for (const key of requiredColumns) {
  if (!mapping.columns?.[key]) {
    throw new Error(`Falta la columna ${key} en el mapeo.`);
  }
}

const text = await readFile(path.resolve(values.input), "utf8");
const delimiter = mapping.delimiter ?? detectDelimiter(text);
const rows = parseDelimited(text, delimiter);
const headers = rows.shift().map((header) => header.trim());
const indexes = Object.fromEntries(requiredColumns.map((key) => {
  const index = headers.indexOf(mapping.columns[key]);
  if (index < 0) {
    throw new Error(`La columna mapeada ${mapping.columns[key]} no existe en el CSV.`);
  }
  return [key, index];
}));

function codedValue(group, rawValue, rowNumber) {
  const normalized = String(rawValue ?? "").trim();
  for (const [canonical, sourceValues] of Object.entries(mapping.values[group] ?? {})) {
    if (sourceValues.map(String).includes(normalized)) {
      return canonical;
    }
  }
  throw new Error(`Fila ${rowNumber}: codigo desconocido en ${group}: ${JSON.stringify(normalized)}.`);
}

const outputLines = [];
for (let index = 0; index < rows.length; index += 1) {
  const rowNumber = index + 2;
  const row = rows[index];
  const annualGrossSalary = parseMappedNumber(row[indexes.annualGrossSalary], mapping.numberFormat);
  const weight = parseMappedNumber(row[indexes.weight], mapping.numberFormat);
  if (!Number.isFinite(annualGrossSalary) || annualGrossSalary < 0) {
    throw new Error(`Fila ${rowNumber}: salario anual invalido.`);
  }
  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error(`Fila ${rowNumber}: ponderacion invalida.`);
  }
  const workingTime = codedValue("workingTime", row[indexes.workingTime], rowNumber);
  const record = {
    annualGrossSalary,
    weight,
    sex: codedValue("sex", row[indexes.sex], rowNumber),
    ageBand: codedValue("ageBand", row[indexes.ageBand], rowNumber),
    fullTime: workingTime === "full_time"
  };
  outputLines.push(JSON.stringify(record));
}

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, `${outputLines.join("\n")}\n`, { flag: "wx" });
console.log(`Normalizados ${outputLines.length} registros en ${output}.`);
