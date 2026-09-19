import { createHash } from "node:crypto";
import { createWriteStream } from "node:fs";
import { access, mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { parseArgs } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: { source: { type: "string" } }
});
const sourceId = values.source ?? "ine-ees-2022";
const catalog = JSON.parse(await readFile(path.join(root, "data", "sources", "catalog.json"), "utf8"));
const source = catalog.sources.find((candidate) => candidate.id === sourceId);
if (!source?.directDownloadUrl) {
  throw new Error(`No existe una descarga directa catalogada para ${sourceId}.`);
}

const fileName = new URL(source.directDownloadUrl).pathname.split("/").at(-1);
const destinationDirectory = path.join(root, "data", "raw", sourceId);
const destination = path.join(destinationDirectory, fileName);
const temporary = `${destination}.partial`;
await mkdir(destinationDirectory, { recursive: true });

try {
  await access(destination);
  throw new Error(`El fichero raw ya existe y no se sobrescribira: ${destination}`);
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

const response = await fetch(source.directDownloadUrl, {
  redirect: "follow",
  headers: { "user-agent": "Salariometro data pipeline/0.1" }
});
if (!response.ok || !response.body) {
  throw new Error(`La descarga oficial fallo con HTTP ${response.status}.`);
}

const hash = createHash("sha256");
const hashingStream = new Transform({
  transform(chunk, _encoding, callback) {
    hash.update(chunk);
    callback(null, chunk);
  }
});

try {
  await pipeline(Readable.fromWeb(response.body), hashingStream, createWriteStream(temporary, { flags: "wx" }));
  await rename(temporary, destination);
} catch (error) {
  await unlink(temporary).catch(() => {});
  throw error;
}

const fileStat = await stat(destination);
const receipt = {
  schemaVersion: 1,
  sourceId,
  requestedUrl: source.directDownloadUrl,
  finalUrl: response.url,
  retrievedAt: new Date().toISOString(),
  fileName,
  bytes: fileStat.size,
  sha256: hash.digest("hex"),
  responseHeaders: {
    etag: response.headers.get("etag"),
    lastModified: response.headers.get("last-modified")
  }
};
await writeFile(
  path.join(destinationDirectory, "receipt.json"),
  `${JSON.stringify(receipt, null, 2)}\n`,
  { flag: "wx" }
);

console.log(JSON.stringify(receipt, null, 2));
console.log("Descarga completada. Revisa el ZIP antes de aprobar el lock versionado.");
