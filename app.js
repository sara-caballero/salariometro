import { compareSalary } from "./src/statistics/percentile-engine.mjs";
import { formatSalaryInput, parseSalary } from "./src/ui/salary-input.mjs";

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});
const euroPrecise = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
const integer = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });

const elements = {
  form: document.querySelector("#salary-form"),
  salary: document.querySelector("#salary"),
  salaryError: document.querySelector("#salary-error"),
  monthly: document.querySelector("#monthly-equivalent"),
  age: document.querySelector("#age"),
  region: document.querySelector("#region"),
  resultPanel: document.querySelector("#result-panel"),
  loading: document.querySelector("#result-loading"),
  empty: document.querySelector("#result-empty"),
  unavailable: document.querySelector("#result-unavailable"),
  unavailableMessage: document.querySelector("#unavailable-message"),
  ready: document.querySelector("#result-ready"),
  percentile: document.querySelector("#percentile-number"),
  statement: document.querySelector("#result-statement"),
  context: document.querySelector("#result-context"),
  quality: document.querySelector("#quality-badge"),
  dots: document.querySelector("#percentile-dots"),
  nationalMedian: document.querySelector("#national-median"),
  nationalMean: document.querySelector("#national-mean"),
  comparisons: document.querySelector("#comparison-list"),
  sourceName: document.querySelector("#source-name"),
  sourceDescription: document.querySelector("#source-description"),
  sourceSample: document.querySelector("#source-sample")
};

let dataset = null;
let calculated = false;

async function loadDataset() {
  try {
    const response = await fetch("./data/derived/distributions-ees-2022.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("No se pudo cargar la distribución oficial.", error);
    return null;
  }
}

function showState(state) {
  elements.loading.hidden = state !== "loading";
  elements.empty.hidden = state !== "empty";
  elements.unavailable.hidden = state !== "unavailable";
  elements.ready.hidden = state !== "ready";
  elements.resultPanel.setAttribute("aria-busy", state === "loading" ? "true" : "false");
}

function updateMonthlyEquivalent() {
  const salary = parseSalary(elements.salary.value);
  if (!Number.isFinite(salary) || salary <= 0) {
    elements.monthly.textContent = "La equivalencia bruta mensual aparecerá aquí.";
    return;
  }
  elements.monthly.textContent = `${euro.format(salary)} brutos al año equivalen a ${euroPrecise.format(salary / 12)} brutos al mes en 12 pagas.`;
}

function renderDots(percent) {
  const safePercent = Math.max(0, Math.min(100, percent));
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 100; index += 1) {
    const dot = document.createElement("span");
    dot.className = `percentile-dot${index < safePercent ? " filled" : ""}`;
    dot.setAttribute("aria-hidden", "true");
    fragment.append(dot);
  }
  elements.dots.replaceChildren(fragment);
  elements.dots.setAttribute(
    "aria-label",
    percent === 100
      ? "Los 100 puntos representan un resultado superior al 99 % tras el redondeo."
      : `${safePercent} de los 100 puntos representan salarios estrictamente inferiores.`
  );
}

function percentileCount(percent) {
  return percent === 100 ? "Más de 99 de 100" : `${percent} de 100`;
}

function selectedSex() {
  return document.querySelector('input[name="sex"]:checked')?.value ?? "prefer_not_to_say";
}

function comparisonRequests(salary) {
  const comparisons = [];
  const age = Number(elements.age.value);
  const sex = selectedSex();

  if (sex !== "prefer_not_to_say") {
    comparisons.push({ label: "Por sexo", request: { salary, comparison: { kind: "sex", value: sex } } });
  }
  if (elements.age.value && Number.isInteger(age)) {
    comparisons.push({ label: "Por edad", request: { salary, comparison: { kind: "age", age } } });
  }
  if (elements.age.value && Number.isInteger(age) && sex !== "prefer_not_to_say") {
    comparisons.push({
      label: "Sexo y edad",
      request: { salary, comparison: { kind: "sex_age", sex, age } }
    });
  }
  if (elements.region.value) {
    comparisons.push({
      label: "Por zona de trabajo",
      request: {
        salary,
        comparison: { kind: "workplace_region", code: elements.region.value }
      }
    });
  }
  return comparisons;
}

function statisticRows(result) {
  const list = document.createElement("dl");
  list.className = "comparison-statistics";
  for (const [label, value] of [
    ["Mediana", result.statistics.median],
    ["Media", result.statistics.mean]
  ]) {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;
    description.textContent = euroPrecise.format(value);
    row.append(term, description);
    list.append(row);
  }
  return list;
}

function addComparisonCard(label, result) {
  const card = document.createElement("article");
  card.className = "comparison-card";
  const heading = document.createElement("small");
  heading.textContent = label;
  const value = document.createElement("strong");
  const detail = document.createElement("p");

  if (result.status === "ok") {
    value.textContent = percentileCount(result.displayPercent);
    detail.textContent = result.statement;
    card.append(heading, value, detail, statisticRows(result));
  } else {
    value.textContent = "Sin dato fiable";
    detail.textContent = result.message;
    card.append(heading, value, detail);
  }
  elements.comparisons.append(card);
}

function renderReady(salary, national) {
  elements.percentile.textContent = national.displayPercent === 100 ? ">99" : String(national.displayPercent);
  elements.statement.textContent = national.statement;
  elements.context.textContent = `${euro.format(salary)} brutos al año. Datos ${national.source.referenceYear}.`;
  elements.quality.textContent = national.quality === "caution" ? "Muestra con cautela" : "Muestra publicable";
  elements.nationalMedian.textContent = euroPrecise.format(national.statistics.median);
  elements.nationalMean.textContent = euroPrecise.format(national.statistics.mean);
  renderDots(national.displayPercent);

  elements.comparisons.replaceChildren();
  for (const item of comparisonRequests(salary)) {
    addComparisonCard(item.label, compareSalary(dataset, item.request));
  }

  elements.sourceName.textContent = national.source.dataset;
  elements.sourceDescription.textContent = `INE, ${national.source.referenceYear}. Resultado ponderado para personas asalariadas a jornada completa. Elaboración propia de Salariometro a partir de los microdatos anonimizados.`;
  elements.sourceSample.textContent = `${integer.format(national.sampleCount)} registros muestrales en la comparación nacional.`;
  showState("ready");
}

function calculate() {
  const salary = parseSalary(elements.salary.value);
  if (!Number.isFinite(salary) || salary <= 0 || salary > 10000000) {
    elements.salaryError.textContent = "Introduce un salario anual válido y mayor que cero.";
    elements.salary.setAttribute("aria-invalid", "true");
    elements.salary.focus();
    return;
  }
  elements.salaryError.textContent = "";
  elements.salary.removeAttribute("aria-invalid");
  elements.salary.value = formatSalaryInput(salary);
  updateMonthlyEquivalent();
  calculated = true;

  if (!dataset) {
    elements.unavailableMessage.textContent = "No se ha podido cargar el fichero de datos. Recarga la página para volver a intentarlo.";
    showState("unavailable");
    return;
  }

  let national;
  try {
    national = compareSalary(dataset, { salary, comparison: { kind: "national" } });
  } catch (error) {
    console.error("La distribución no ha superado la validación local.", error);
    elements.unavailableMessage.textContent = "El fichero de datos no ha superado la validación local.";
    showState("unavailable");
    return;
  }
  if (national.status !== "ok") {
    elements.unavailableMessage.textContent = national.message;
    showState("unavailable");
    return;
  }
  renderReady(salary, national);
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculate();
});

elements.salary.addEventListener("input", updateMonthlyEquivalent);
elements.salary.addEventListener("blur", () => {
  const salary = parseSalary(elements.salary.value);
  if (Number.isFinite(salary) && salary > 0) {
    elements.salary.value = formatSalaryInput(salary);
  }
});

for (const control of [
  elements.age,
  elements.region,
  ...document.querySelectorAll('input[name="sex"]')
]) {
  control.addEventListener("change", () => {
    if (calculated) {
      calculate();
    }
  });
}

dataset = await loadDataset();
showState("empty");
