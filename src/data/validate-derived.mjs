const ALLOWED_DIMENSION_KEYS = new Set(["country", "workingTime", "sex", "ageBand", "workplaceRegion"]);

export function validateDistributionSet(dataset, options = {}) {
  const errors = [];
  const synthetic = dataset?.publicationStatus === "synthetic";
  const minimumSampleCount = dataset?.contract?.minimumSampleCount;
  const cautionSampleCount = dataset?.contract?.cautionSampleCount;

  if (!dataset || typeof dataset !== "object") {
    return ["El conjunto derivado no es un objeto."];
  }
  if (dataset.schemaVersion !== 2) {
    errors.push("schemaVersion debe ser 2.");
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
  if (dataset.publicationStatus !== "synthetic" && !/^[a-f0-9]{64}$/.test(dataset.provenance?.rawSha256 ?? "")) {
    errors.push("Falta una huella SHA-256 valida del fichero raw.");
  }
  if (dataset.contract?.statistic !== "weighted_empirical_percentile_strictly_below") {
    errors.push("El contrato estadistico no coincide con el motor.");
  }
  if (dataset.contract?.displayResolution !== "integer_percentage_point") {
    errors.push("La resolucion de publicacion no coincide con el motor.");
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
    if (!Number.isFinite(cohort?.statistics?.mean) || cohort.statistics.mean < 0) {
      errors.push(`${prefix}: media invalida.`);
    }
    if (!Number.isFinite(cohort?.statistics?.median) || cohort.statistics.median < 0) {
      errors.push(`${prefix}: mediana invalida.`);
    }
    let previousPercentile = Number.NEGATIVE_INFINITY;
    for (const percentile of ["10", "25", "50", "75", "90"]) {
      const value = cohort?.statistics?.percentiles?.[percentile];
      if (!Number.isFinite(value) || value < 0 || value < previousPercentile) {
        errors.push(`${prefix}: percentil ${percentile} invalido.`);
      }
      previousPercentile = value;
    }
    if (cohort?.statistics?.percentiles?.["50"] !== cohort?.statistics?.median) {
      errors.push(`${prefix}: la mediana no coincide con el percentil 50.`);
    }
    if (!["caution", "publishable"].includes(cohort?.quality)) {
      errors.push(`${prefix}: quality invalida.`);
    } else if (!synthetic && cohort.sampleCount < cautionSampleCount && cohort.quality !== "caution") {
      errors.push(`${prefix}: una muestra menor que ${cautionSampleCount} debe marcarse caution.`);
    }
    if (!Array.isArray(cohort?.rankSteps) || cohort.rankSteps.length === 0) {
      errors.push(`${prefix}: rankSteps debe contener observaciones.`);
      continue;
    }

    let previousSalary = Number.NEGATIVE_INFINITY;
    let previousDisplayPercent = 0;
    for (const point of cohort.rankSteps) {
      if (!Array.isArray(point) || point.length !== 2) {
        errors.push(`${prefix}: escalon mal formado.`);
        continue;
      }
      const [salary, displayPercent] = point;
      if (!Number.isFinite(salary) || salary < 0 || salary <= previousSalary) {
        errors.push(`${prefix}: salarios no estrictamente ordenados.`);
      }
      if (!Number.isInteger(displayPercent) || displayPercent < 1 || displayPercent > 100 || displayPercent <= previousDisplayPercent) {
        errors.push(`${prefix}: porcentajes publicados no estrictamente crecientes.`);
      }
      previousSalary = salary;
      previousDisplayPercent = displayPercent;
    }
    if (previousDisplayPercent !== 100) {
      errors.push(`${prefix}: el ultimo porcentaje publicado debe ser 100.`);
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

