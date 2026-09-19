export function parseSalary(rawValue) {
  const compact = String(rawValue ?? "").trim().replace(/\s/g, "").replace(/[^\d.,]/g, "");
  if (!compact) {
    return Number.NaN;
  }

  const lastComma = compact.lastIndexOf(",");
  const lastDot = compact.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    return Number(compact.split(thousandsSeparator).join("").replace(decimalSeparator, "."));
  }

  const separator = lastComma >= 0 ? "," : lastDot >= 0 ? "." : null;
  if (!separator) {
    return Number(compact);
  }
  const parts = compact.split(separator);
  if (parts.length > 2 || parts.at(-1).length === 3) {
    return Number(parts.join(""));
  }
  return Number(`${parts[0]}.${parts[1]}`);
}

export function formatSalaryInput(value) {
  if (!Number.isFinite(value)) {
    return "";
  }
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(value);
}
