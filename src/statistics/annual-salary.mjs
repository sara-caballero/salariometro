export function calculateAnnualGrossSalary({
  components,
  relationMonths,
  relationDays,
  unpaidSpecialDays,
  temporaryDisabilityDays
}) {
  const inputs = [
    ...(components ?? []),
    relationMonths,
    relationDays,
    unpaidSpecialDays,
    temporaryDisabilityDays
  ];
  if (!Array.isArray(components) || components.length === 0 || inputs.some((value) => !Number.isFinite(value))) {
    throw new Error("La formula salarial requiere todos sus componentes numericos.");
  }

  const relationDaysInYear = Math.min(365, relationMonths * 30.42 + relationDays);
  const paidDaysInYear = relationDaysInYear - unpaidSpecialDays - temporaryDisabilityDays;
  if (paidDaysInYear <= 0 || paidDaysInYear > 365) {
    throw new Error(`Los dias remunerados son incompatibles: ${paidDaysInYear}.`);
  }

  const salary = (365 / paidDaysInYear) * components.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(salary) || salary < 0) {
    throw new Error("El salario anual calculado no es valido.");
  }
  return salary;
}
