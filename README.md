# md-2-word

Convert Markdown files to Word (`.docx`) using [pandoc](https://pandoc.org), with a library of curated style templates.

## Requirements

- [Node.js](https://nodejs.org) 18 or later
- [pandoc](https://pandoc.org/installing.html) 3 or later

## Installation

```
npm install
```

## Usage

### Convert a Markdown file

```
node convert.js document.md
```

Output is written next to the source file (`document.docx`). The `professional` style is used by default.

### Pick a style

```
node convert.js document.md --style academic
node convert.js document.md output.docx --style report
```

### List available styles

```
node convert.js --styles
```

### Use your own template

Drop any `.docx` file into `templates/` and it is immediately available as a style:

```
node convert.js document.md --template path/to/corp-template.docx
```

---

## Templates

Four ready-to-use templates are included. All are A4, justified body text, with automatic multilevel heading numbering (1., 1.1., 1.1.1.).

| Style | Font | Body size | Line spacing | Margins |
|---|---|---|---|---|
| `professional` | Calibri | 11pt | 1.15× | 2.5 cm all round |
| `academic` | Cambria | 12pt | 1.5× | 2.5 cm all round |
| `report` | Calibri | 11pt | 1.15× | 3 cm left, 2 cm right (for binding) |
| `minimal` | Georgia | 11pt | 1.3× | 3 cm all round |

Example outputs for each style are in [`examples/`](examples/).

---

## Metadata (title, author, date)

Add a YAML block at the top of your Markdown file to include a title page:

```markdown
---
title: My Document
subtitle: An optional subtitle
author: Your Name
date: May 2026
---

## First Section
...
```

---

## Customising styles

Style configs live in `styles/` as plain JSON files. After editing, rebuild the templates:

```
node make-template.js                  # rebuild all
node make-template.js --style report   # rebuild one
node make-template.js --list           # describe all styles
```

Each JSON file controls:

```jsonc
{
  "font": "Calibri",          // body and heading font
  "bodySize": 22,             // half-points (22 = 11pt)
  "lineSpacing": 276,         // 240 = 1.0×, 276 ≈ 1.15×, 360 = 1.5×
  "paragraphSpaceAfter": 160, // space after each paragraph (twips)
  "justification": "both",   // "both" = justified, "left" = ragged right
  "margins": { "top": 1440, "right": 1440, "bottom": 1440, "left": 1440 },
  "headings": [
    { "size": 32, "bold": true, "italic": false, "spaceBefore": 480, "spaceAfter": 120 },
    ...
  ]
}
```

All size values are in [DXA](https://docs.microsoft.com/en-us/openspecs/office_standards/ms-oe376/56da929f-d1d7-4b27-b1f6-a9c40eb58e36): 1440 DXA = 1 inch = 2.54 cm.

---

## Adding a new style from scratch

1. Create `styles/my-style.json` based on one of the existing configs
2. Run `node make-template.js --style my-style`
3. A new `templates/my-style.docx` is created
4. Optionally open it in Word to fine-tune styles and save

---

## How it works

```
base.docx  ──►  make-template.js  ──►  templates/professional.docx
                (applies style config)
                                         │
                                         ▼
                         pandoc + convert.js  ──►  output.docx
```

- **`base.docx`** — a Word file with correctly configured multilevel heading numbering (source: [krissen/pandoc-extra](https://github.com/krissen/pandoc-extra)). All generated templates are built on top of it.
- **`make-template.js`** — reads a style JSON config, overlays font/spacing/margin settings onto `base.docx`, and writes to `templates/`.
- **`convert.js`** — calls pandoc with the chosen template as `--reference-doc`.
- **`check-templates.js`** — utility to inspect which templates have automatic heading numbering.

---

## Supported Markdown features

| Feature | Syntax |
|---|---|
| Headings | `# H1` through `###### H6` |
| Bold / italic | `**bold**`, `*italic*` |
| Bullet list | `- item` |
| Numbered list | `1. item` |
| Table | `\| col \| col \|` |
| Code block | ` ``` ` |
| Inline code | `` `code` `` |
| Blockquote | `> text` |
| Horizontal rule | `---` |
| Metadata | YAML front matter |
