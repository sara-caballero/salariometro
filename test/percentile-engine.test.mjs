import assert from "node:assert/strict";
import test from "node:test";
import { buildDistributionSet } from "../src/data/build-distributions.mjs";
import { validateDistributionSet } from "../src/data/validate-derived.mjs";
import { compareSalary, weightedPercentile } from "../src/statistics/percentile-engine.mjs";

const records = [
  { annualGrossSalary: 10000, weight: 1, sex: "woman", ageBand: "25_34", fullTime: true },
  { annualGrossSalary: 20000, weight: 2, sex: "woman", ageBand: "25_34", fullTime: true },
  { annualGrossSalary: 20000, weight: 3, sex: "man", ageBand: "35_44", fullTime: true },
  { annualGrossSalary: 40000, weight: 4, sex: "man", ageBand: "35_44", fullTime: true },
  { annualGrossSalary: 9000, weight: 99, sex: "woman", ageBand: "under_25", fullTime: false }
];

const dataset = buildDistributionSet(records, {
  publicationStatus: "synthetic",
  minimumSampleCount: 1,
  cautionSampleCount: 3,
  generatedAt: "2026-01-01T00:00:00.000Z"
});

test("la distribucion sintetica de prueba supera el esquema con permiso explicito", () => {
  assert.deepEqual(validateDistributionSet(dataset, { allowSynthetic: true }), []);
  assert.ok(validateDistributionSet(dataset).some((error) => error.includes("sinteticos")));
});

test("calcula el percentil ponderado con regla estrictamente inferior para empates", () => {
  const national = dataset.cohorts.find((cohort) => cohort.id === "national");
  assert.equal(weightedPercentile(national.points, national.weightedPopulation, 20000), 10);
  assert.equal(weightedPercentile(national.points, national.weightedPopulation, 20001), 60);
});

test("respeta los limites inferior y superior", () => {
  const national = dataset.cohorts.find((cohort) => cohort.id === "national");
  assert.equal(weightedPercentile(national.points, national.weightedPopulation, 0), 0);
  assert.equal(weightedPercentile(national.points, national.weightedPopulation, 100000), 100);
});

test("devuelve un texto trazable y redondea solo para mostrar", () => {
  const result = compareSalary(dataset, {
    salary: 30000,
    comparison: { kind: "national" }
  }, { allowSynthetic: true });
  assert.equal(result.status, "ok");
  assert.equal(result.percentile, 60);
  assert.equal(result.displayPercent, 60);
  assert.equal(result.statement, "Ganas más que el 60 % de los asalariados a jornada completa en España.");
});

test("mapea edad exacta al tramo oficial y usa la cohorte separada", () => {
  const result = compareSalary(dataset, {
    salary: 20000,
    comparison: { kind: "age", age: 29 }
  }, { allowSynthetic: true });
  assert.equal(result.status, "ok");
  assert.equal(result.ageBand, "25_34");
  assert.equal(result.percentile, 100 / 3);
});

test("solo usa cruces que existen en la distribucion conjunta", () => {
  const present = compareSalary(dataset, {
    salary: 25000,
    comparison: { kind: "sex_age", sex: "woman", age: 30 }
  }, { allowSynthetic: true });
  assert.equal(present.status, "ok");

  const absent = compareSalary(dataset, {
    salary: 25000,
    comparison: { kind: "sex_age", sex: "woman", age: 40 }
  }, { allowSynthetic: true });
  assert.equal(absent.status, "unavailable");
  assert.equal(absent.reason, "cohort_unavailable");
});

test("no sustituye ciudad ni comunidad de residencia por otra geografia", () => {
  const city = compareSalary(dataset, {
    salary: 30000,
    comparison: { kind: "city_residence", code: "28079", label: "Madrid" }
  }, { allowSynthetic: true });
  assert.deepEqual(city, {
    status: "unavailable",
    reason: "city_distribution_unavailable",
    message: "No hay datos disponibles para esta ciudad."
  });

  const region = compareSalary(dataset, {
    salary: 30000,
    comparison: { kind: "autonomous_community_residence", code: "13", label: "Comunidad de Madrid" }
  }, { allowSynthetic: true });
  assert.equal(region.status, "unavailable");
  assert.equal(region.reason, "residence_distribution_unavailable");
});

test("rechaza entradas invalidas y datos no validados", () => {
  const invalid = compareSalary(dataset, { salary: Number.NaN }, { allowSynthetic: true });
  assert.equal(invalid.status, "invalid_input");

  const reviewDataset = { ...dataset, publicationStatus: "review_required", provenance: { ...dataset.provenance, rawSha256: "a".repeat(64) } };
  const pending = compareSalary(reviewDataset, { salary: 30000 });
  assert.equal(pending.status, "unavailable");
  assert.equal(pending.reason, "source_not_validated");
});

test("el builder suprime cohortes pequenas y excluye jornada parcial", () => {
  const strict = buildDistributionSet(records, {
    publicationStatus: "synthetic",
    minimumSampleCount: 3,
    cautionSampleCount: 5
  });
  assert.equal(strict.coverage.inputRecordCount, 5);
  assert.equal(strict.coverage.fullTimeRecordCount, 4);
  assert.ok(strict.cohorts.some((cohort) => cohort.id === "national"));
  assert.ok(strict.suppressedCohorts.some((cohort) => cohort.id === "sex:woman"));
});
