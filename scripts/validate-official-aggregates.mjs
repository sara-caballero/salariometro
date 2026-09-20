import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertValidDistributionSet } from "../src/data/validate-derived.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const datasetPath = path.join(root, "data", "derived", "distributions-ees-2022.json");
const validationPath = path.join(root, "data", "sources", "ine-ees-2022.validation.json");
const dataset = JSON.parse(await readFile(datasetPath, "utf8"));
const validation = JSON.parse(await readFile(validationPath, "utf8"));
assertValidDistributionSet(dataset);

function readStatistic(cohort, pathExpression) {
  return pathExpression.split(".").reduce((value, key) => value?.[key], cohort.statistics);
}

const results = [];
for (const check of validation.checks) {
  const cohort = dataset.cohorts.find((candidate) => candidate.id === check.cohortId);
  if (!cohort) {
    throw new Error(`Falta la cohorte oficial de control ${check.cohortId}.`);
  }
  const actual = readStatistic(cohort, check.statistic);
  if (!Number.isFinite(actual)) {
    throw new Error(`El estadistico ${check.statistic} de ${check.cohortId} no es numerico.`);
  }
  const absoluteDifference = Math.abs(actual - check.expected);
  results.push({ ...check, actual, absoluteDifference });
  if (absoluteDifference > check.tolerance) {
    throw new Error(
      `${check.cohortId} ${check.statistic}: ${actual} difiere de ${check.expected} en ${absoluteDifference}, por encima de ${check.tolerance}.`
    );
  }
}

dataset.publicationStatus = "validated";
dataset.validation = {
  status: "passed",
  validatedAt: new Date().toISOString(),
  officialTable: validation.officialTable,
  checksPassed: results.length,
  maximumAbsoluteDifferenceEur: Math.max(...results.map((result) => result.absoluteDifference))
};
assertValidDistributionSet(dataset);
await writeFile(datasetPath, `${JSON.stringify(dataset)}\n`);
console.log(`Validacion oficial superada: ${results.length} controles.`);
for (const result of results) {
  console.log(`${result.cohortId} ${result.statistic}: ${result.actual.toFixed(4)}; diferencia ${result.absoluteDifference.toFixed(4)} euros.`);
}
