const CANDIDATE_DELIMITERS = [";", ",", "\t", "|"];

export function detectDelimiter(text) {
  const firstRecord = text.split(/\r?\n/, 1)[0] ?? "";
  let best = { delimiter: null, count: 0 };

  for (const delimiter of CANDIDATE_DELIMITERS) {
    let count = 0;
    let quoted = false;
    for (let index = 0; index < firstRecord.length; index += 1) {
      const character = firstRecord[index];
      if (character === '"') {
        if (quoted && firstRecord[index + 1] === '"') {
          index += 1;
        } else {
          quoted = !quoted;
        }
      } else if (!quoted && character === delimiter) {
        count += 1;
      }
    }
    if (count > best.count) {
      best = { delimiter, count };
    }
  }

  if (!best.delimiter) {
    throw new Error("No se pudo detectar un separador de columnas.");
  }
  return best.delimiter;
}

export function parseDelimited(text, delimiter = detectDelimiter(text)) {
  if (typeof delimiter !== "string" || delimiter.length !== 1) {
    throw new Error("El separador debe ser un unico caracter.");
  }

  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (!quoted && character === delimiter) {
      row.push(field);
      field = "";
      continue;
    }

    if (!quoted && (character === "\n" || character === "\r")) {
      if (character === "\r" && text[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (quoted) {
    throw new Error("El CSV termina dentro de un campo entrecomillado.");
  }

  row.push(field);
  if (row.some((value) => value !== "")) {
    rows.push(row);
  }
  return rows;
}

export function parseMappedNumber(rawValue, numberFormat) {
  const value = String(rawValue ?? "").trim();
  if (!value) {
    return Number.NaN;
  }

  const thousands = numberFormat?.thousandsSeparator ?? "";
  const decimal = numberFormat?.decimalSeparator ?? ".";
  let normalized = value;
  if (thousands) {
    normalized = normalized.split(thousands).join("");
  }
  if (decimal !== ".") {
    normalized = normalized.replace(decimal, ".");
  }
  return Number(normalized);
}
