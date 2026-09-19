const ALLOWED_DIMENSION_KEYS = new Set(["country", "workingTime", "sex", "ageBand"]);

function nearlyEqual(left, right) {
  return Math.abs(left - right) <= Math.max(1e-8, Math.abs(right) * 1e-10);
}

export function validateDistributionSet(dataset, options = {}) {
  const errors = [];
  const synthetic = dataset?.publicationStatus === "synthetic";
  const minimumSampleCount = dataset?.contract?.minimumSampleCount;
  const cautionSampleCount = dataset?.contract?.cautionSampleCount;

  if (!dataset || typeof dataset !== "object") {
    return ["El conjunto derivado no es un objeto."];
  }
  if (dataset.schemaVersion !== 1) {
    errors.push("schemaVersion debe ser 1.");
  }
  if (!["review_required", "validated", "synthetic"].includes(dataset.publicationStatus)) {
    errors.push("publicationStatus no es valido.");
  }
  if (synthetic && !options.allowSynthetic) {
    errors.push("Los datos sinteticos solo se aceptan con allowSynthetic.");
  }
  if (!dataset.provenance?.sourceId || !Number.isInteger(dataset.provenance?.referenceYear)) {
    errors.push("Faltan sourceId o referenceYear en provenance.");
  }
  if (dataset.publicationStatus !== "synthetic" && !dataset.provenance?.rawSha256) {
    errors.push("Falta la huella SHA-256 del fichero raw.");
  }
  if (dataset.contract?.statistic !== "weighted_empirical_percentile_strictly_below") {
    errors.push("El contrato estadistico no coincide con el motor.");
  }
  if (!Number.isInteger(minimumSampleCount) || minimumSampleCount < 1) {
    errors.push("minimumSampleCount no es valido.");
  }
  if (!Number.isInteger(cautionSampleCount) || cautionSampleCount < minimumSampleCount) {
    errors.push("cautionSampleCount no es valido.");
  }
  if (!Array.isArray(dataset.cohorts)) {
    errors.push("cohorts debe ser una lista.");
    return errors;
  }

  const ids = new Set();
  for (const cohort of dataset.cohorts) {
    const prefix = `Cohorte ${cohort?.id ?? "sin-id"}`;
    if (!cohort?.id || ids.has(cohort.id)) {
      errors.push(`${prefix}: identificador ausente o duplicado.`);
    } else {
      ids.add(cohort.id);
    }
    const dimensions = cohort?.dimensions ?? {};
    for (const key of Object.keys(dimensions)) {
      if (!ALLOWED_DIMENSION_KEYS.has(key)) {
        errors.push(`${prefix}: dimension no permitida ${key}.`);
      }
    }
    if (dimensions.country !== "ES" || dimensions.workingTime !== "full_time") {
      errors.push(`${prefix}: poblacion o pais incompatibles.`);
    }
    if (!Number.isInteger(cohort?.sampleCount) || cohort.sampleCount < 1) {
      errors.push(`${prefix}: sampleCount invalido.`);
    } else if (!synthetic && cohort.sampleCount < minimumSampleCount) {
      errors.push(`${prefix}: deberia estar suprimida por muestra insuficiente.`);
    }
    if (!Number.isFinite(cohort?.weightedPopulation) || cohort.weightedPopulation <= 0) {
      errors.push(`${prefix}: poblacion ponderada invalida.`);
    }
    if (!["caution", "publishable"].includes(cohort?.quality)) {
      errors.push(`${prefix}: quality invalida.`);
    } else if (!synthetic && cohort.sampleCount < cautionSampleCount && cohort.quality !== "caution") {
      errors.push(`${prefix}: una muestra menor que ${cautionSampleCount} debe marcarse caution.`);
    }
    if (!Array.isArray(cohort?.points) || cohort.points.length === 0) {
      errors.push(`${prefix}: points debe contener observaciones.`);
      continue;
    }

    let previousSalary = Number.NEGATIVE_INFINITY;
    let previousCumulativeWeight = 0;
    for (const point of cohort.points) {
      if (!Array.isArray(point) || point.length !== 2) {
        errors.push(`${prefix}: punto mal formado.`);
        continue;
      }
      const [salary, cumulativeWeight] = point;
      if (!Number.isFinite(salary) || salary < 0 || salary <= previousSalary) {
        errors.push(`${prefix}: salarios no estrictamente ordenados.`);
      }
      if (!Number.isFinite(cumulativeWeight) || cumulativeWeight <= previousCumulativeWeight) {
        errors.push(`${prefix}: pesos acumulados no estrictamente crecientes.`);
      }
      previousSalary = salary;
      previousCumulativeWeight = cumulativeWeight;
    }
    if (!nearlyEqual(previousCumulativeWeight, cohort.weightedPopulation)) {
      errors.push(`${prefix}: el ultimo peso acumulado no coincide con weightedPopulation.`);
    }
  }

  return errors;
}

export function assertValidDistributionSet(dataset, options = {}) {
  const errors = validateDistributionSet(dataset, options);
  if (errors.length > 0) {
    throw new Error(`Distribucion derivada invalida:\n- ${errors.join("\n- ")}`);
  }
}
