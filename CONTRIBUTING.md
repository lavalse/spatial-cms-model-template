# Contributing to Spatial CMS Templates

Thank you for contributing! This guide explains how to author, validate, and submit templates.

## Template file conventions

- **File naming**: `lowercase-kebab-case.json` (e.g., `building-footprint.json`)
- **Location**: Place templates in the appropriate category directory under `templates/`
- **Size limit**: Template files must be under 1 MB

## Required fields

Every template must include:

- `templateVersion` — currently `"1.0.0"`
- `metadata.name` — a human-readable name
- At least one model in `models[]`, each with:
  - `key` — unique identifier (lowercase, alphanumeric with underscores/hyphens)
  - `name` — display name
  - At least one field in `fields[]`, each with `key`, `label`, and `fieldType`

## Recommended fields

- `metadata.description` — what the template provides and when to use it
- `metadata.author` — author name or organization
- `metadata.license` — SPDX license identifier (e.g., `CC-BY-4.0`)
- `metadata.tags` — searchable tags for discovery

## Field types

| Type | Notes |
|------|-------|
| `string` | Free text |
| `number` | Numeric values, optionally constrained via `validationJson` |
| `boolean` | True/false |
| `date` | Date values |
| `json` | Arbitrary JSON data |
| `enum_` | **Requires** non-empty `enumValues` array |
| `reference` | **Requires** `referenceModelKey` pointing to another model's `key` in the same template |
| `geometry` | Geometry field |

## Category directories

Use an existing category when possible:

| Category | Use for |
|----------|---------|
| `general/` | Domain-agnostic, broadly applicable models |
| `plateau/` | Japan PLATEAU / CityGML-based models |
| `osm/` | OpenStreetMap-aligned models |
| `gif/` | Japan Digital Agency GIF reference models (abstract classes — Address, Facility, Building, Land, etc.) |
| `municipal/` | 自治体標準オープンデータセット concrete dataset definitions (AED locations, public facilities, etc.) |

If none fit, propose a new category in your PR description with a brief explanation.

### Label language by category

- `general/`, `plateau/`, `osm/` — English `label`
- `gif/`, `municipal/` — **Japanese `label`** matching the official spec column names verbatim (e.g., `"label": "都道府県コード"`). Field-level English explanations are not stored per-field (the schema does not support a field-level `description`); place English documentation in the **model**'s `description` field instead.

### Model key prefixes

| Category | Prefix | Example |
|----------|--------|---------|
| `plateau/` | `plateau_*` | `plateau_bldg` |
| `osm/` | `osm_*` | `osm_building` |
| `gif/` | `gif_*` | `gif_facility` |
| `municipal/` | `municipal_*` | `municipal_aed` |

## Guidelines

### The `dataset` section

The `dataset` section is a **hint only** — the CMS shows it as a recommendation but does not auto-create datasets. Set reasonable defaults that make sense for the template's intended data source.

### Governance

Default `governance` to `manual` for both `approvalMode` and `publishMode` unless there is a clear reason for `auto` (e.g., automated data pipelines with trusted sources).

### Coordinate reference system

`srid` must match the coordinate system of the intended data source:

| SRID | CRS | Typical use |
|------|-----|-------------|
| 4326 | WGS84 | Global / default |
| 6668 | JGD2011 | Japan (PLATEAU) |
| 3857 | Web Mercator | Web mapping |

### Model keys

Model keys must be globally unique within a CMS instance. Use descriptive prefixes (e.g., `plateau_bldg`, `osm_building`) to avoid collisions.

## Testing locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Validate all templates:

   ```bash
   node scripts/validate.js
   ```

   This checks every template against the JSON Schema and warns about duplicate model keys.

3. Build the catalog index:

   ```bash
   node scripts/build-index.js
   ```

## PR checklist

Before submitting:

- [ ] `node scripts/validate.js` passes with no errors
- [ ] Template is in the correct category directory
- [ ] `metadata.name` and `metadata.description` are filled in
- [ ] Model keys use descriptive prefixes to avoid collisions
- [ ] `srid` matches the intended data source's CRS
- [ ] PR description explains the use case for the template
- [ ] (Optional) Include a screenshot showing the template imported in the CMS
