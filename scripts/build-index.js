#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.resolve(__dirname, "../templates");
const INDEX_PATH = path.join(TEMPLATES_DIR, "index.json");

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
  const templateFiles = findTemplateFiles(TEMPLATES_DIR);
  const index = [];

  for (const file of templateFiles) {
    const relPath = path.relative(TEMPLATES_DIR, file);
    const category = path.dirname(relPath);
    const id = relPath.replace(/\.json$/, "");

    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
      console.warn(`Skipping ${relPath} — invalid JSON`);
      continue;
    }

    const metadata = data.metadata || {};
    const models = data.models || [];
    const fieldCount = models.reduce(
      (sum, m) => sum + (m.fields ? m.fields.length : 0),
      0
    );

    index.push({
      id,
      file: relPath,
      name: metadata.name || id,
      description: metadata.description || "",
      author: metadata.author || "",
      tags: metadata.tags || [],
      category: category === "." ? "uncategorized" : category,
      modelCount: models.length,
      fieldCount,
      hasDataset: !!data.dataset,
    });
  }

  // Sort by category then name
  index.sort((a, b) => {
    const catCmp = a.category.localeCompare(b.category);
    if (catCmp !== 0) return catCmp;
    return a.name.localeCompare(b.name);
  });

  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n");
  console.log(`Generated ${INDEX_PATH} with ${index.length} template(s)`);
}

main();
