import { buildDistributionSet } from "./src/data/build-distributions.mjs";
import { compareSalary } from "./src/statistics/percentile-engine.mjs";
import { formatSalaryInput, parseSalary } from "./src/ui/salary-input.mjs";

const euro = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});
const euroMonthly = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const elements = {
  form: document.querySelector("#salary-form"),
  salary: document.querySelector("#salary"),
  salaryError: document.querySelector("#salary-error"),
  monthly: document.querySelector("#monthly-equivalent"),
  age: document.querySelector("#age"),
  region: document.querySelector("#region"),
  city: document.querySelector("#city"),
  dataModeLabel: document.querySelector("#data-mode-label"),
  demoBanner: document.querySelector("#demo-banner"),
  resultPanel: document.querySelector("#result-panel"),
  loading: document.querySelector("#result-loading"),
  empty: document.querySelector("#result-empty"),
  unavailable: document.querySelector("#result-unavailable"),
  ready: document.querySelector("#result-ready"),
  percentile: document.querySelector("#percentile-number"),
  statement: document.querySelector("#result-statement"),
  context: document.querySelector("#result-context"),
  quality: document.querySelector("#quality-badge"),
  dots: document.querySelector("#percentile-dots"),
  comparisons: document.querySelector("#comparison-list"),
  sourceName: document.querySelector("#source-name"),
  sourceDescription: document.querySelector("#source-description")
};

const demoMode = new URLSearchParams(window.location.search).get("demo") === "1";
let dataset = null;
let calculated = false;

function buildDemoDataset() {
  const ageBands = ["under_25", "25_34", "35_44", "45_54", "55_plus"];
  const records = Array.from({ length: 200 }, (_, index) => ({
    annualGrossSalary: 10500 + index * 190,
    weight: 1 + (index % 7) / 10,
    sex: index % 2 === 0 ? "woman" : "man",
    ageBand: ageBands[index % ageBands.length],
    fullTime: true
  }));
  const result = buildDistributionSet(records, {
    publicationStatus: "synthetic",
    minimumSampleCount: 1,
    cautionSampleCount: 20,
    sourceId: "salariometro-demo",
    referenceYear: 2022,
    generatedAt: "2026-09-19T00:00:00.000Z"
  });
  result.provenance.sourceOrganization = "Ejemplo ficticio de Salariometro";
  result.provenance.derivationResponsibility = "Datos sintéticos exclusivos para revisar la interfaz";
  return result;
}

async function loadDataset() {
  if (demoMode) {
    elements.demoBanner.hidden = false;
    elements.dataModeLabel.textContent = "Modo demostración";
    return buildDemoDataset();
  }

  try {
    const response = await fetch("./data/derived/distributions-ees-2022.json", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
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
    elements.monthly.textContent = "La equivalencia mensual aparecerá aquí.";
    return;
  }
  elements.monthly.textContent = `${euro.format(salary)} al año equivalen a ${euroMonthly.format(salary / 12)} al mes en 12 pagas.`;
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
    `${safePercent} de los 100 puntos representan salarios estrictamente inferiores.`
  );
}

function selectedSex() {
  return document.querySelector('input[name="sex"]:checked')?.value ?? "prefer_not_to_say";
}

function slug(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function comparisonRequests(salary) {
  const comparisons = [];
  const age = Number(elements.age.value);
  const sex = selectedSex();

  if (elements.age.value && Number.isInteger(age)) {
    comparisons.push({ label: "Por edad", request: { salary, comparison: { kind: "age", age } } });
  }
  if (sex !== "prefer_not_to_say") {
    comparisons.push({ label: "Por sexo", request: { salary, comparison: { kind: "sex", value: sex } } });
  }
  if (elements.age.value && Number.isInteger(age) && sex !== "prefer_not_to_say") {
    comparisons.push({
      label: "Sexo y edad",
      request: { salary, comparison: { kind: "sex_age", sex, age } }
    });
  }
  if (elements.region.value) {
    const label = elements.region.options[elements.region.selectedIndex].text;
    comparisons.push({
      label: "Comunidad de residencia",
      request: {
        salary,
        comparison: { kind: "autonomous_community_residence", code: elements.region.value, label }
      }
    });
  }
  if (elements.city.value.trim()) {
    const label = elements.city.value.trim();
    comparisons.push({
      label: "Ciudad de residencia",
      request: {
        salary,
        comparison: { kind: "city_residence", code: slug(label), label }
      }
    });
  }
  return comparisons;
}

function addComparisonCard(label, result) {
  const card = document.createElement("article");
  card.className = "comparison-card";
  const heading = document.createElement("small");
  heading.textContent = label;
  const value = document.createElement("strong");
  const detail = document.createElement("p");

  if (result.status === "ok") {
    value.textContent = `${result.displayPercent} de 100`;
    detail.textContent = result.statement;
  } else {
    value.textContent = "Sin dato fiable";
    detail.textContent = result.message;
  }

  card.append(heading, value, detail);
  elements.comparisons.append(card);
}

function renderReady(salary, national) {
  elements.percentile.textContent = String(national.displayPercent);
  elements.statement.textContent = national.statement;
  elements.context.textContent = `${euro.format(salary)} brutos al año · referencia ${national.source.referenceYear}`;
  elements.quality.textContent = demoMode
    ? "Ejemplo ficticio"
    : national.quality === "caution" ? "Muestra con cautela" : "Muestra validada";
  renderDots(national.displayPercent);

  elements.comparisons.replaceChildren();
  for (const item of comparisonRequests(salary)) {
    addComparisonCard(
      item.label,
      compareSalary(dataset, item.request, { allowSynthetic: demoMode })
    );
  }

  if (demoMode) {
    elements.sourceName.textContent = "Ejemplo ficticio de Salariometro";
    elements.sourceDescription.textContent = "Distribución sintética. No describe los salarios reales de España y nunca se publica como resultado.";
  } else {
    elements.sourceName.textContent = national.source.organization;
    elements.sourceDescription.textContent = `Encuesta de Estructura Salarial ${national.source.referenceYear}. Personas asalariadas a jornada completa dentro de la cobertura de la fuente.`;
  }
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
    showState("unavailable");
    return;
  }

  const national = compareSalary(
    dataset,
    { salary, comparison: { kind: "national" } },
    { allowSynthetic: demoMode }
  );
  if (national.status !== "ok") {
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
  elements.city,
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
if (demoMode) {
  elements.salary.value = "38.400";
  updateMonthlyEquivalent();
  calculate();
}
