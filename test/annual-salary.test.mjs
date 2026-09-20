import assert from "node:assert/strict";
import test from "node:test";
import { calculateAnnualGrossSalary } from "../src/statistics/annual-salary.mjs";

test("aplica la formula anual oficial sin ajuste cuando hay 365 dias remunerados", () => {
  const salary = calculateAnnualGrossSalary({
    components: [30000, 500, 1000, 0],
    relationMonths: 12,
    relationDays: 0,
    unpaidSpecialDays: 0,
    temporaryDisabilityDays: 0
  });
  assert.equal(salary, 31500);
});

test("anualiza el salario y resta los dias no remunerados definidos por el INE", () => {
  const salary = calculateAnnualGrossSalary({
    components: [18000, 0, 0, 0],
    relationMonths: 6,
    relationDays: 0,
    unpaidSpecialDays: 2,
    temporaryDisabilityDays: 0
  });
  assert.ok(Math.abs(salary - (365 / (6 * 30.42 - 2)) * 18000) < 1e-9);
});

test("rechaza formulas incompletas o sin dias remunerados", () => {
  assert.throws(() => calculateAnnualGrossSalary({
    components: [],
    relationMonths: 12,
    relationDays: 0,
    unpaidSpecialDays: 0,
    temporaryDisabilityDays: 0
  }));
  assert.throws(() => calculateAnnualGrossSalary({
    components: [1000],
    relationMonths: 0,
    relationDays: 0,
    unpaidSpecialDays: 0,
    temporaryDisabilityDays: 0
  }));
});
