import { ageToBand, getAgeBand } from "./age-bands.mjs";
import { getWorkplaceRegion } from "./workplace-regions.mjs";
import { assertValidDistributionSet } from "../data/validate-derived.mjs";

function unavailable(reason, message) {
  return { status: "unavailable", reason, message };
}

function resolveComparison(comparison) {
  if (!comparison || comparison.kind === "national") {
    return { id: "national", label: "los asalariados a jornada completa en España" };
  }

  if (comparison.kind === "sex") {
    if (comparison.value === "prefer_not_to_say") {
      return unavailable("not_provided", "No se ha solicitado una comparación por sexo.");
    }
    if (!["woman", "man"].includes(comparison.value)) {
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
    if (!["woman", "man"].includes(comparison.sex)) {
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

  if (comparison.kind === "workplace_region") {
    const region = getWorkplaceRegion(comparison.code);
    if (!region) {
      return { status: "invalid_input", reason: "invalid_workplace_region", message: "La zona de trabajo no es válida." };
    }
    return {
      id: `workplace-region:${region.code}`,
      label: `los asalariados a jornada completa cuyo centro de trabajo está en ${region.label}`,
      workplaceRegion: region.code,
      workplaceRegionLabel: region.label
    };
  }

  return { status: "invalid_input", reason: "invalid_comparison", message: "El tipo de comparación no es válido." };
}

export function roundedPercentile(rankSteps, salary) {
  let low = 0;
  let high = rankSteps.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (rankSteps[middle][0] < salary) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low === 0 ? 0 : rankSteps[low - 1][1];
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
    return unavailable("cohort_unavailable", "No hay datos fiables para esta comparación.");
  }

  const displayPercent = roundedPercentile(cohort.rankSteps, request.salary);
  const statement = displayPercent === 100
    ? `Tu salario supera al de más del 99 % de ${resolved.label}.`
    : `Ganas más que el ${displayPercent} % de ${resolved.label}.`;
  return {
    status: "ok",
    displayPercent,
    statement,
    cohortId: cohort.id,
    ageBand: resolved.ageBand ?? cohort.dimensions.ageBand ?? null,
    ageBandLabel: resolved.ageBand ? getAgeBand(resolved.ageBand)?.label ?? null : null,
    workplaceRegion: resolved.workplaceRegion ?? cohort.dimensions.workplaceRegion ?? null,
    workplaceRegionLabel: resolved.workplaceRegionLabel ?? null,
    statistics: cohort.statistics,
    quality: cohort.quality,
    sampleCount: cohort.sampleCount,
    weightedPopulation: cohort.weightedPopulation,
    source: {
      organization: dataset.provenance.sourceOrganization,
      dataset: dataset.provenance.dataset,
      sourceId: dataset.provenance.sourceId,
      referenceYear: dataset.provenance.referenceYear,
      publishedAt: dataset.provenance.publishedAt
    }
  };
}
