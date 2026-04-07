#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");

const SCHEMA_PATH = path.resolve(__dirname, "../schema/template-v1.json");
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

function findTemplateFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTemplateFiles(fullPath));
    } else if (
      entry.name.endsWith(".json") &&
      entry.name !== "index.json"
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, "utf-8"));
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema);

  const templateFiles = findTemplateFiles(TEMPLATES_DIR);

  if (templateFiles.length === 0) {
    console.error("No template files found under templates/");
    process.exit(1);
  }

  let hasErrors = false;
  const allModelKeys = new Map(); // key -> [file, ...]

  for (const file of templateFiles) {
    const relPath = path.relative(path.resolve(__dirname, ".."), file);
    let data;

    try {
      data = JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch (err) {
      console.error(`FAIL  ${relPath} — Invalid JSON: ${err.message}`);
      hasErrors = true;
      continue;
    }

    const valid = validate(data);
    if (!valid) {
      console.error(`FAIL  ${relPath}`);
      for (const err of validate.errors) {
        console.error(`      ${err.instancePath || "/"} ${err.message}`);
      }
      hasErrors = true;
    } else {
      console.log(`PASS  ${relPath}`);
    }

    // Collect model keys for global uniqueness check
    if (data.models && Array.isArray(data.models)) {
      for (const model of data.models) {
        if (model.key) {
          if (!allModelKeys.has(model.key)) {
            allModelKeys.set(model.key, []);
          }
          allModelKeys.get(model.key).push(relPath);
        }
      }
    }
  }

  // Check for duplicate model keys across templates
  let hasDuplicates = false;
  for (const [key, files] of allModelKeys) {
    if (files.length > 1) {
      console.warn(`WARN  Duplicate model key "${key}" found in:`);
      for (const f of files) {
        console.warn(`      - ${f}`);
      }
      hasDuplicates = true;
    }
  }

  console.log();
  console.log(
    `Validated ${templateFiles.length} template(s), ` +
      `${allModelKeys.size} model key(s)` +
      (hasDuplicates ? " (with duplicate warnings)" : "")
  );

  if (hasErrors) {
    process.exit(1);
  }
}

main();
