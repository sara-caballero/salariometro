import assert from "node:assert/strict";
import test from "node:test";
import { formatSalaryInput, parseSalary } from "../src/ui/salary-input.mjs";

test("interpreta formatos salariales habituales en España", () => {
  assert.equal(parseSalary("38.400"), 38400);
  assert.equal(parseSalary("38 400 €"), 38400);
  assert.equal(parseSalary("38.400,50"), 38400.5);
  assert.equal(parseSalary("38400,50"), 38400.5);
  assert.equal(parseSalary("38,400"), 38400);
});

test("rechaza entradas vacias o no numericas", () => {
  assert.ok(Number.isNaN(parseSalary("")));
  assert.ok(Number.isNaN(parseSalary("euros")));
});

test("formatea el valor para el campo sin alterar el calculo interno", () => {
  assert.equal(formatSalaryInput(38400), "38.400");
  assert.equal(formatSalaryInput(Number.NaN), "");
});
