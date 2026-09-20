import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDistributionSet } from "../src/data/build-distributions.mjs";
import { assertValidDistributionSet } from "../src/data/validate-derived.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(root, "data", "sources", "ine-ees-2022.lock.json");
const rawPath = path.join(root, "data", "raw", "ine-ees-2022", "datos_2022.zip");
const canonicalPath = path.join(root, "data", "work", "ine-ees-2022", "canonical.ndjson");
const outputPath = path.join(root, "data", "derived", "distributions-ees-2022.json");

const lock = JSON.parse(await readFile(lockPath, "utf8"));
if (lock.status !== "approved" || !/^[a-f0-9]{64}$/.test(lock.sha256 ?? "")) {
  throw new Error("La fuente no tiene un lock SHA-256 aprobado; el build de produccion esta bloqueado.");
}

const raw = await readFile(rawPath);
const rawSha256 = createHash("sha256").update(raw).digest("hex");
const rawStat = await stat(rawPath);
if (rawSha256 !== lock.sha256 || rawStat.size !== lock.bytes) {
  throw new Error("El fichero raw no coincide con el lock aprobado.");
}

const lines = (await readFile(canonicalPath, "utf8")).split(/\r?\n/).filter(Boolean);
const records = lines.map((line, index) => {
  try {
    return JSON.parse(line);
  } catch {
    throw new Error(`NDJSON invalido en la linea ${index + 1}.`);
  }
});
const dataset = buildDistributionSet(records, {
  sourceId: "ine-ees-2022",
  referenceYear: 2022,
  rawSha256,
  publicationStatus: "review_required",
  minimumSampleCount: 100,
  cautionSampleCount: 500
});
assertValidDistributionSet(dataset);
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(dataset)}\n`);
console.log(`Distribuciones creadas en ${outputPath}. Estado: review_required.`);
