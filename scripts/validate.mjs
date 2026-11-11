// Checks that every schema compiles, every example in examples/valid passes,
// every example in examples/invalid fails, and every known type descriptor is valid.
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = "https://spec.ntxprotocol.com/schemas/0.1/";
const MAX_MESSAGE_BYTES = 65536;

const ajv = new Ajv2020({ allErrors: true, strict: true });
for (const file of readdirSync(join(root, "schemas"))) {
  ajv.addSchema(readJson(join(root, "schemas", file)));
}
const validateMessage = ajv.getSchema(base + "message.schema.json");
const validateDescriptor = ajv.getSchema(base + "type-descriptor.schema.json");

let failures = 0;

for (const file of readdirSync(join(root, "examples/valid"))) {
  const path = join(root, "examples/valid", file);
  const message = readJson(path);
  const problems = [];
  if (!validateMessage(message)) problems.push(ajv.errorsText(validateMessage.errors));
  if (readFileSync(path).length > MAX_MESSAGE_BYTES) problems.push("larger than 65536 bytes");
  for (const s of strings(message)) {
    if (s !== s.normalize("NFC")) problems.push(`text is not NFC: ${JSON.stringify(s)}`);
    if (s.includes("\r")) problems.push(`text contains \\r: ${JSON.stringify(s)}`);
  }
  report(`valid/${file}`, problems);
}

for (const file of readdirSync(join(root, "examples/invalid"))) {
  const message = readJson(join(root, "examples/invalid", file));
  report(`invalid/${file}`, validateMessage(message) ? ["passed but should fail"] : []);
}

for (const file of readdirSync(join(root, "types")).filter((f) => f.endsWith(".ntxtype.json"))) {
  const descriptor = readJson(join(root, "types", file));
  const problems = [];
  if (!validateDescriptor(descriptor)) problems.push(ajv.errorsText(validateDescriptor.errors));
  if (`${descriptor.ntxType}.ntxtype.json` !== file) problems.push("file name does not match ntxType");
  report(`types/${file}`, problems);
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll checks passed");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function* strings(value) {
  if (typeof value === "string") yield value;
  else if (value && typeof value === "object") {
    for (const v of Object.values(value)) yield* strings(v);
  }
}

function report(name, problems) {
  if (problems.length === 0) {
    console.log(`ok   ${name}`);
  } else {
    failures++;
    console.log(`FAIL ${name}\n     ${problems.join("\n     ")}`);
  }
}
