import { AGE_BANDS } from "../statistics/age-bands.mjs";

const VALID_SEX = new Set(["woman", "man"]);
const VALID_AGE_BANDS = new Set(AGE_BANDS.map((band) => band.id));

function createAccumulator(id, dimensions) {
  return {
    id,
    dimensions,
    sampleCount: 0,
    weightedPopulation: 0,
    salaryWeights: new Map()
  };
}

function addRecord(accumulator, record) {
  accumulator.sampleCount += 1;
  accumulator.weightedPopulation += record.weight;
  accumulator.salaryWeights.set(
    record.annualGrossSalary,
    (accumulator.salaryWeights.get(record.annualGrossSalary) ?? 0) + record.weight
  );
}

function finalizeAccumulator(accumulator, cautionSampleCount) {
  let cumulativeWeight = 0;
  const points = [...accumulator.salaryWeights.entries()]
    .sort(([left], [right]) => left - right)
    .map(([salary, weight]) => {
      cumulativeWeight += weight;
      return [salary, cumulativeWeight];
    });

  return {
    id: accumulator.id,
    dimensions: accumulator.dimensions,
    sampleCount: accumulator.sampleCount,
    weightedPopulation: accumulator.weightedPopulation,
    quality: accumulator.sampleCount < cautionSampleCount ? "caution" : "publishable",
    points
  };
}

function validateCanonicalRecord(record, rowNumber) {
  if (!record || typeof record !== "object") {
    throw new Error(`Registro ${rowNumber}: no es un objeto.`);
  }
  if (!Number.isFinite(record.annualGrossSalary) || record.annualGrossSalary < 0) {
    throw new Error(`Registro ${rowNumber}: salario anual invalido.`);
  }
  if (!Number.isFinite(record.weight) || record.weight <= 0) {
    throw new Error(`Registro ${rowNumber}: ponderacion invalida.`);
  }
  if (!VALID_SEX.has(record.sex)) {
    throw new Error(`Registro ${rowNumber}: categoria de sexo desconocida.`);
  }
  if (!VALID_AGE_BANDS.has(record.ageBand)) {
    throw new Error(`Registro ${rowNumber}: tramo de edad desconocido.`);
  }
  if (typeof record.fullTime !== "boolean") {
    throw new Error(`Registro ${rowNumber}: indicador de jornada invalido.`);
  }
}

export function buildDistributionSet(records, options = {}) {
  const minimumSampleCount = options.minimumSampleCount ?? 100;
  const cautionSampleCount = options.cautionSampleCount ?? 500;
  if (!Number.isInteger(minimumSampleCount) || minimumSampleCount < 1) {
    throw new Error("minimumSampleCount debe ser un entero positivo.");
  }
  if (!Number.isInteger(cautionSampleCount) || cautionSampleCount < minimumSampleCount) {
    throw new Error("cautionSampleCount no puede ser menor que minimumSampleCount.");
  }

  const accumulators = new Map();
  const ensure = (id, dimensions) => {
    if (!accumulators.has(id)) {
      accumulators.set(id, createAccumulator(id, dimensions));
    }
    return accumulators.get(id);
  };

  let inputRecordCount = 0;
  let fullTimeRecordCount = 0;
  for (const record of records) {
    inputRecordCount += 1;
    validateCanonicalRecord(record, inputRecordCount);
    if (!record.fullTime) {
      continue;
    }
    fullTimeRecordCount += 1;

    const dimensions = { country: "ES", workingTime: "full_time" };
    addRecord(ensure("national", dimensions), record);
    addRecord(
      ensure(`sex:${record.sex}`, { ...dimensions, sex: record.sex }),
      record
    );
    addRecord(
      ensure(`age:${record.ageBand}`, { ...dimensions, ageBand: record.ageBand }),
      record
    );
    addRecord(
      ensure(`sex:${record.sex}|age:${record.ageBand}`, {
        ...dimensions,
        sex: record.sex,
        ageBand: record.ageBand
      }),
      record
    );
  }

  const cohorts = [];
  const suppressedCohorts = [];
  for (const accumulator of accumulators.values()) {
    if (accumulator.sampleCount < minimumSampleCount) {
      suppressedCohorts.push({
        id: accumulator.id,
        reason: "sample_below_threshold",
        sampleCount: accumulator.sampleCount,
        minimumSampleCount
      });
      continue;
    }
    cohorts.push(finalizeAccumulator(accumulator, cautionSampleCount));
  }

  cohorts.sort((left, right) => left.id.localeCompare(right.id));
  suppressedCohorts.sort((left, right) => left.id.localeCompare(right.id));

  return {
    schemaVersion: 1,
    publicationStatus: options.publicationStatus ?? "review_required",
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    provenance: {
      sourceId: options.sourceId ?? "ine-ees-2022",
      sourceOrganization: "Instituto Nacional de Estadistica (INE)",
      referenceYear: options.referenceYear ?? 2022,
      rawSha256: options.rawSha256 ?? null,
      transformationVersion: options.transformationVersion ?? "0.1.0",
      derivationResponsibility: "Elaboracion propia de Salariometro a partir de microdatos del INE"
    },
    contract: {
      measure: "annual_gross_salary_eur",
      population: "employees_full_time",
      statistic: "weighted_empirical_percentile_strictly_below",
      tieRule: "salary_strictly_lower",
      minimumSampleCount,
      cautionSampleCount
    },
    coverage: {
      enabledDimensions: ["national", "sex", "age", "sex_age"],
      unavailableDimensions: {
        autonomousCommunityResidence: "source_geography_is_not_worker_residence",
        cityResidence: "municipality_not_available"
      },
      inputRecordCount,
      fullTimeRecordCount
    },
    cohorts,
    suppressedCohorts
  };
}
