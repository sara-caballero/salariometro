import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidDistributionSet } from "../src/data/validate-derived.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.resolve(process.argv[2] ?? path.join(root, "data", "derived", "distributions-ees-2022.json"));
const dataset = JSON.parse(await readFile(input, "utf8"));
assertValidDistributionSet(dataset);
console.log(`Distribucion valida: ${dataset.cohorts.length} cohortes, estado ${dataset.publicationStatus}.`);
