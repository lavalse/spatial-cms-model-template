# Spatial CMS Community Templates

[![Validate Templates](https://github.com/{owner}/spatial-cms-templates/actions/workflows/validate.yml/badge.svg)](https://github.com/{owner}/spatial-cms-templates/actions/workflows/validate.yml)

Community-maintained model templates for [Spatial CMS](https://github.com/eukarya-inc/spatial-cms) — a spatial data governance control plane.

## What are templates?

Templates are JSON files that define **model schemas** (fields, geometry types, coordinate reference systems) for Spatial CMS. They are schema definitions, not data. When imported, the CMS creates the defined models so users can start managing spatial data immediately.

## Using a template

### URL import (recommended)

Paste a raw GitHub URL into the CMS Template Gallery's URL import:

```
https://raw.githubusercontent.com/{owner}/spatial-cms-templates/main/templates/{category}/{file}.json
```

For example:

```
https://raw.githubusercontent.com/{owner}/spatial-cms-templates/main/templates/plateau/bldg.json
```

### API call

```bash
curl -X POST https://your-cms-instance/api/v1/templates/resolve \
  -H "Content-Type: application/json" \
  -d '{"url": "https://raw.githubusercontent.com/{owner}/spatial-cms-templates/main/templates/plateau/bldg.json"}'
```

### Bundled

Copy template files into the CMS's built-in `src/templates/` directory.

## Available templates

Browse the full catalog in [`templates/index.json`](templates/index.json) or explore by category:

| Category | Description |
|----------|-------------|
| [`general/`](templates/general/) | General-purpose models (POI, buildings, etc.) |
| [`plateau/`](templates/plateau/) | [PLATEAU](https://www.mlit.go.jp/plateau/) Japan 3D city models |
| [`osm/`](templates/osm/) | OpenStreetMap-aligned models |

## Template spec reference

Each template follows the [template-v1 schema](schema/template-v1.json):

```json
{
  "$schema": "https://spatial-cms.dev/template/v1.json",
  "templateVersion": "1.0.0",
  "metadata": { "name": "...", "description": "...", "author": "...", "tags": [] },
  "models": [
    {
      "key": "unique_model_key",
      "name": "Display Name",
      "geometryType": "POINT | LINESTRING | POLYGON | MIXED | NONE",
      "srid": 4326,
      "fields": [
        { "key": "field_key", "label": "Label", "fieldType": "string" }
      ]
    }
  ],
  "dataset": { "name": "...", "description": "..." }
}
```

Key points:

- **`models[]`** is the only section that gets executed. `dataset` is a recommendation hint only.
- **`geometryType: "NONE"`** for non-spatial models (lookup tables, categories).
- **`srid`** defaults to 4326 (WGS84). Use 6668 for JGD2011 (Japan), 3857 for Web Mercator.
- **`fieldType`** values: `string`, `number`, `boolean`, `date`, `json`, `enum_`, `reference`, `geometry`.
- **`fieldType: "reference"`** requires `referenceModelKey` pointing to another model's `key` in the same template.
- Template files must be under 1 MB.

## Category conventions

| Category | When to use |
|----------|-------------|
| `general/` | Domain-agnostic, broadly applicable models |
| `plateau/` | Japan PLATEAU / CityGML-based models (typically SRID 6668) |
| `osm/` | Models aligned with OpenStreetMap tagging conventions |

Propose new categories in your PR description when existing ones don't fit.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on authoring and submitting templates.

## License

This repository is licensed under [MIT](LICENSE). Individual templates may declare their own license in `metadata.license` (e.g., `CC-BY-4.0`, `ODbL-1.0`).
