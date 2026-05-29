#!/usr/bin/env node
// Converts a Markdown file to .docx via pandoc.
//
// Usage:
//   node convert.js <input.md> [output.docx] [--style professional]
//   node convert.js <input.md> [output.docx] [--template path/to/custom.docx]
//   node convert.js --styles   (list available styles)
"use strict";

const { execSync } = require("child_process");
const fs   = require("fs");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "templates");

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--styles")) {
  const templates = fs.readdirSync(TEMPLATES_DIR).filter(f => f.endsWith(".docx"));
  if (templates.length === 0) {
    console.log("No templates yet. Run: node make-template.js");
  } else {
    console.log("Available templates in templates/:");
    templates.forEach(f => console.log(`  --style ${f.replace(".docx", "")}`));
  }
  process.exit(0);
}

let inputArg, outputArg, styleArg, templateArg;

for (let i = 0; i < args.length; i++) {
  if      (args[i] === "--style"    && args[i+1]) { styleArg    = args[++i]; }
  else if (args[i] === "--template" && args[i+1]) { templateArg = args[++i]; }
  else if (!inputArg)  { inputArg  = args[i]; }
  else if (!outputArg) { outputArg = args[i]; }
}

if (!inputArg) {
  console.error("Usage: node convert.js <input.md> [output.docx] [--style NAME | --template FILE]");
  console.error("       node convert.js --styles");
  process.exit(1);
}

const inputFile = path.resolve(inputArg);
if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

const outputFile = outputArg
  ? path.resolve(outputArg)
  : inputFile.replace(/\.md$/i, ".docx");

// ── Resolve reference doc ─────────────────────────────────────────────────────

let refDoc;

if (templateArg) {
  refDoc = path.resolve(templateArg);
} else {
  const style = styleArg ?? "professional";
  refDoc = path.join(TEMPLATES_DIR, `${style}.docx`);
  if (!fs.existsSync(refDoc)) {
    console.error(`Template "${style}.docx" not found in templates/`);
    console.error(`Run: node convert.js --styles  to see what's available`);
    process.exit(1);
  }
}

if (!fs.existsSync(refDoc)) {
  console.error(`Reference doc not found: ${refDoc}`);
  process.exit(1);
}

// ── Convert ───────────────────────────────────────────────────────────────────

const cmd = [
  "pandoc",
  `"${inputFile}"`,
  "-o", `"${outputFile}"`,
  `--reference-doc="${refDoc}"`,
].join(" ");

try {
  execSync(cmd, { stdio: "inherit" });
  console.log(`Created: ${outputFile}  (style: ${styleArg ?? "professional"})`);
} catch {
  process.exit(1);
}
