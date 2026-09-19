import assert from "node:assert/strict";
import test from "node:test";
import { detectDelimiter, parseDelimited, parseMappedNumber } from "../src/data/csv.mjs";

test("detecta y analiza CSV con comillas, separadores y saltos de linea", () => {
  const text = 'a;b;c\r\n1;"dos;2";"linea 1\nlinea 2"\r\n';
  assert.equal(detectDelimiter(text), ";");
  assert.deepEqual(parseDelimited(text, ";"), [
    ["a", "b", "c"],
    ["1", "dos;2", "linea 1\nlinea 2"]
  ]);
});

test("convierte numeros segun el formato declarado", () => {
  assert.equal(
    parseMappedNumber("12.345,67", { decimalSeparator: ",", thousandsSeparator: "." }),
    12345.67
  );
  assert.ok(Number.isNaN(parseMappedNumber("", {})));
});
