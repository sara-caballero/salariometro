import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import path from "node:path";
import { detectDelimiter, parseDelimited } from "../src/data/csv.mjs";

const { values } = parseArgs({
  options: { input: { type: "string" } }
});
if (!values.input) {
  throw new Error("Uso: node scripts/inspect-csv.mjs --input ruta/al/fichero.csv");
}

const input = path.resolve(values.input);
const text = await readFile(input, "utf8");
const delimiter = detectDelimiter(text);
const rows = parseDelimited(text, delimiter);
if (rows.length < 2) {
  throw new Error("El fichero no contiene cabecera y registros.");
}

const headers = rows[0].map((header) => header.trim());
const samples = headers.map(() => new Set());
for (const row of rows.slice(1, 101)) {
  headers.forEach((_header, index) => {
    const value = row[index]?.trim();
    if (value && samples[index].size < 8) {
      samples[index].add(value);
    }
  });
}

console.log(`Fichero: ${input}`);
console.log(`Separador probable: ${JSON.stringify(delimiter)}`);
console.log(`Filas leidas: ${rows.length - 1}`);
console.log("Columnas y muestras (no constituyen un mapeo aprobado):");
headers.forEach((header, index) => {
  console.log(`- ${header}: ${JSON.stringify([...samples[index]])}`);
});
