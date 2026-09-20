import assert from "node:assert/strict";
import test from "node:test";
import { buildDistributionSet } from "../src/data/build-distributions.mjs";
import { validateDistributionSet } from "../src/data/validate-derived.mjs";
import { compareSalary, roundedPercentile } from "../src/statistics/percentile-engine.mjs";

const records = [
  { annualGrossSalary: 10000, weight: 1, sex: "woman", ageBand: "20_29", workplaceRegion: "1", fullTime: true },
  { annualGrossSalary: 20000, weight: 2, sex: "woman", ageBand: "20_29", workplaceRegion: "1", fullTime: true },
  { annualGrossSalary: 20000, weight: 3, sex: "man", ageBand: "30_39", workplaceRegion: "3", fullTime: true },
  { annualGrossSalary: 40000, weight: 4, sex: "man", ageBand: "30_39", workplaceRegion: "3", fullTime: true },
  { annualGrossSalary: 9000, weight: 99, sex: "woman", ageBand: "under_20", workplaceRegion: "6", fullTime: false }
];

const dataset = buildDistributionSet(records, {
  publicationStatus: "synthetic",
  minimumSampleCount: 1,
  cautionSampleCount: 3,
  generatedAt: "2026-01-01T00:00:00.000Z"
});

test("la distribucion sintetica supera el esquema con permiso explicito", () => {
  assert.deepEqual(validateDistributionSet(dataset, { allowSynthetic: true }), []);
  assert.ok(validateDistributionSet(dataset).some((error) => error.includes("sinteticos")));
});

test("respeta la regla estrictamente inferior en salarios empatados", () => {
  const national = dataset.cohorts.find((cohort) => cohort.id === "national");
  assert.equal(roundedPercentile(national.rankSteps, 20000), 10);
  assert.equal(roundedPercentile(national.rankSteps, 20000.01), 60);
});

test("la compresion conserva exactamente el entero publicado en todos los limites", () => {
  const national = dataset.cohorts.find((cohort) => cohort.id === "national");
  const fullDistribution = [
    [10000, 1],
    [20000, 5],
    [40000, 4]
  ];
  const expected = (salary) => Math.round(
    100 * fullDistribution
      .filter(([observedSalary]) => observedSalary < salary)
      .reduce((sum, [, weight]) => sum + weight, 0) / 10
  );
  for (const salary of [0, 9999, 10000, 10000.01, 20000, 20000.01, 40000, 40000.01, 100000]) {
    assert.equal(roundedPercentile(national.rankSteps, salary), expected(salary));
  }
});

test("calcula media y mediana ponderadas de cada cohorte", () => {
  const national = dataset.cohorts.find((cohort) => cohort.id === "national");
  assert.equal(national.statistics.mean, 27000);
  assert.equal(national.statistics.median, 20000);
  assert.deepEqual(national.statistics.percentiles, {
    "10": 10000,
    "25": 20000,
    "50": 20000,
    "75": 40000,
    "90": 40000
  });
});

test("devuelve el texto de España y sus estadisticos", () => {
  const result = compareSalary(dataset, {
    salary: 30000,
    comparison: { kind: "national" }
  }, { allowSynthetic: true });
  assert.equal(result.status, "ok");
  assert.equal(result.displayPercent, 60);
  assert.equal(result.statement, "Ganas más que el 60 % de los asalariados a jornada completa en España.");
  assert.equal(result.statistics.mean, 27000);
  assert.equal(result.statistics.median, 20000);
});

test("expresa el extremo superior como mas del 99 por ciento", () => {
  const result = compareSalary(dataset, {
    salary: 100000,
    comparison: { kind: "national" }
  }, { allowSynthetic: true });
  assert.equal(result.displayPercent, 100);
  assert.equal(
    result.statement,
    "Tu salario supera al de más del 99 % de los asalariados a jornada completa en España."
  );
});

test("mapea la edad al tramo oficial", () => {
  const result = compareSalary(dataset, {
    salary: 20000,
    comparison: { kind: "age", age: 29 }
  }, { allowSynthetic: true });
  assert.equal(result.status, "ok");
  assert.equal(result.ageBand, "20_29");
  assert.equal(result.displayPercent, 33);
});

test("solo usa cruces de sexo y edad observados", () => {
  const present = compareSalary(dataset, {
    salary: 25000,
    comparison: { kind: "sex_age", sex: "woman", age: 29 }
  }, { allowSynthetic: true });
  assert.equal(present.status, "ok");

  const absent = compareSalary(dataset, {
    salary: 25000,
    comparison: { kind: "sex_age", sex: "woman", age: 35 }
  }, { allowSynthetic: true });
  assert.equal(absent.status, "unavailable");
  assert.equal(absent.reason, "cohort_unavailable");
});

test("compara por macroregion del centro de trabajo", () => {
  const result = compareSalary(dataset, {
    salary: 15000,
    comparison: { kind: "workplace_region", code: "1" }
  }, { allowSynthetic: true });
  assert.equal(result.status, "ok");
  assert.equal(result.displayPercent, 33);
  assert.equal(result.workplaceRegionLabel, "Noroeste");
  assert.match(result.statement, /centro de trabajo está en Noroeste/);
});

test("rechaza entradas invalidas y datos no validados", () => {
  const invalid = compareSalary(dataset, { salary: Number.NaN }, { allowSynthetic: true });
  assert.equal(invalid.status, "invalid_input");

  const invalidRegion = compareSalary(dataset, {
    salary: 30000,
    comparison: { kind: "workplace_region", code: "99" }
  }, { allowSynthetic: true });
  assert.equal(invalidRegion.status, "invalid_input");

  const reviewDataset = {
    ...dataset,
    publicationStatus: "review_required"
  };
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
