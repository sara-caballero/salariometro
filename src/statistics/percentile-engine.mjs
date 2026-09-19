import { ageToBand, getAgeBand } from "./age-bands.mjs";
import { assertValidDistributionSet } from "../data/validate-derived.mjs";

function unavailable(reason, message) {
  return { status: "unavailable", reason, message };
}

function resolveComparison(comparison) {
  if (!comparison || comparison.kind === "national") {
    return {
      id: "national",
      label: "los asalariados a jornada completa en España"
    };
  }

  if (comparison.kind === "sex") {
    if (comparison.value === "prefer_not_to_say") {
      return unavailable("not_provided", "No se ha solicitado una comparación por sexo.");
    }
    if (!['woman', 'man'].includes(comparison.value)) {
      return { status: "invalid_input", reason: "invalid_sex", message: "La categoría de sexo no es válida." };
    }
    return {
      id: `sex:${comparison.value}`,
      label: comparison.value === "woman"
        ? "las mujeres asalariadas a jornada completa en España"
        : "los hombres asalariados a jornada completa en España"
    };
  }

  if (comparison.kind === "age") {
    const band = ageToBand(comparison.age);
    if (!band) {
      return { status: "invalid_input", reason: "invalid_age", message: "La edad debe ser un entero entre 16 y 120 años." };
    }
    return {
      id: `age:${band.id}`,
      label: `los asalariados a jornada completa de ${band.label} en España`,
      ageBand: band.id
    };
  }

  if (comparison.kind === "sex_age") {
    if (!['woman', 'man'].includes(comparison.sex)) {
      return { status: "invalid_input", reason: "invalid_sex", message: "La categoría de sexo no es válida." };
    }
    const band = ageToBand(comparison.age);
    if (!band) {
      return { status: "invalid_input", reason: "invalid_age", message: "La edad debe ser un entero entre 16 y 120 años." };
    }
    const noun = comparison.sex === "woman" ? "las mujeres asalariadas" : "los hombres asalariados";
    return {
      id: `sex:${comparison.sex}|age:${band.id}`,
      label: `${noun} a jornada completa de ${band.label} en España`,
      ageBand: band.id
    };
  }

  if (comparison.kind === "autonomous_community_residence") {
    return {
      id: `ccaa-residence:${comparison.code}`,
      label: `los asalariados a jornada completa residentes en ${comparison.label ?? comparison.code}`
    };
  }

  if (comparison.kind === "city_residence") {
    return {
      id: `city-residence:${comparison.code}`,
      label: `los asalariados a jornada completa residentes en ${comparison.label ?? comparison.code}`
    };
  }

  return { status: "invalid_input", reason: "invalid_comparison", message: "El tipo de comparación no es válido." };
}

export function weightedPercentile(points, weightedPopulation, salary) {
  let low = 0;
  let high = points.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (points[middle][0] < salary) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  const lowerWeight = low === 0 ? 0 : points[low - 1][1];
  return (100 * lowerWeight) / weightedPopulation;
}

export function compareSalary(dataset, request, options = {}) {
  const allowSynthetic = options.allowSynthetic === true;
  assertValidDistributionSet(dataset, { allowSynthetic });

  if (dataset.publicationStatus !== "validated" && !(allowSynthetic && dataset.publicationStatus === "synthetic")) {
    return unavailable("source_not_validated", "La fuente todavía no ha superado la validación de publicación.");
  }
  if (!Number.isFinite(request?.salary) || request.salary < 0) {
    return { status: "invalid_input", reason: "invalid_salary", message: "Introduce un salario bruto anual válido." };
  }

  const resolved = resolveComparison(request.comparison);
  if (resolved.status) {
    return resolved;
  }
  const cohort = dataset.cohorts.find((candidate) => candidate.id === resolved.id);
  if (!cohort) {
    if (request.comparison?.kind === "city_residence") {
      return unavailable("city_distribution_unavailable", "No hay datos disponibles para esta ciudad.");
    }
    if (request.comparison?.kind === "autonomous_community_residence") {
      return unavailable(
        "residence_distribution_unavailable",
        "No hay una distribución compatible por comunidad autónoma de residencia."
      );
    }
    return unavailable("cohort_unavailable", "No hay datos fiables para esta comparación.");
  }

  const percentile = weightedPercentile(cohort.points, cohort.weightedPopulation, request.salary);
  const displayPercent = Math.round(percentile);
  return {
    status: "ok",
    percentile,
    displayPercent,
    statement: `Ganas más que el ${displayPercent} % de ${resolved.label}.`,
    cohortId: cohort.id,
    ageBand: resolved.ageBand ?? cohort.dimensions.ageBand ?? null,
    ageBandLabel: resolved.ageBand ? getAgeBand(resolved.ageBand)?.label ?? null : null,
    quality: cohort.quality,
    sampleCount: cohort.sampleCount,
    source: {
      organization: dataset.provenance.sourceOrganization,
      sourceId: dataset.provenance.sourceId,
      referenceYear: dataset.provenance.referenceYear,
      rawSha256: dataset.provenance.rawSha256
    }
  };
}
