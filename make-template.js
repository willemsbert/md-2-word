#!/usr/bin/env node
// Builds reference .docx templates from style configs in styles/.
//
// Base: krissen/pandoc-extra numbered-sections.docx
//   Real Word-generated multilevel heading numbering (1., 1.1., 1.1.1.)
//   https://github.com/krissen/pandoc-extra
//
// Usage:
//   node make-template.js                   build all styles
//   node make-template.js --style academic  build one style
//   node make-template.js --list            list available styles
"use strict";

const fs   = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

const STYLES_DIR    = path.join(__dirname, "styles");
const TEMPLATES_DIR = path.join(__dirname, "templates");
const BASE_DOCX     = path.join(__dirname, "base.docx");

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const styleArg = args.includes("--style") ? args[args.indexOf("--style") + 1] : null;
const listOnly = args.includes("--list");

if (!fs.existsSync(BASE_DOCX)) {
  console.error(`Base template not found: ${BASE_DOCX}`);
  console.error("Download base.docx from: https://github.com/krissen/pandoc-extra/raw/master/templates/numbered-sections.docx");
  process.exit(1);
}

const allStyles = fs.readdirSync(STYLES_DIR)
  .filter(f => f.endsWith(".json"))
  .map(f => path.basename(f, ".json"));

if (listOnly) {
  console.log("Available styles:");
  allStyles.forEach(s => {
    const cfg = JSON.parse(fs.readFileSync(path.join(STYLES_DIR, `${s}.json`), "utf8"));
    console.log(`  ${s.padEnd(16)} ${cfg._description ?? ""}`);
  });
  process.exit(0);
}

const stylesToBuild = styleArg ? [styleArg] : allStyles;

for (const styleName of stylesToBuild) {
  const cfgPath = path.join(STYLES_DIR, `${styleName}.json`);
  if (!fs.existsSync(cfgPath)) {
    console.error(`Style not found: ${styleName}  (looked in ${cfgPath})`);
    process.exit(1);
  }
  buildTemplate(styleName, JSON.parse(fs.readFileSync(cfgPath, "utf8")));
}

// ── Builder ───────────────────────────────────────────────────────────────────

function buildTemplate(name, cfg) {
  const zip = new AdmZip(BASE_DOCX);
  const out = path.join(TEMPLATES_DIR, `${name}.docx`);

  // Patch styles.xml
  let stylesXml = zip.readAsText("word/styles.xml");
  for (const [id, block] of Object.entries(buildStyles(cfg))) {
    stylesXml = replaceStyle(stylesXml, id, block);
  }
  zip.updateFile("word/styles.xml", Buffer.from(stylesXml, "utf8"));

  // Patch document.xml — page size, margins, footer reference
  let docXml = zip.readAsText("word/document.xml");
  const { top, right, bottom, left } = cfg.margins;
  const sectPr = `<w:sectPr>
      <w:footerReference w:type="default" r:id="rIdFooter1"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="${top}" w:right="${right}" w:bottom="${bottom}" w:left="${left}" w:header="709" w:footer="709" w:gutter="0"/>
      <w:footnotePr><w:numRestart w:val="eachSect"/></w:footnotePr>
    </w:sectPr>`;
  docXml = docXml.replace(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/, sectPr);
  if (!docXml.includes("xmlns:r=")) {
    docXml = docXml.replace(
      "<w:document ",
      '<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    );
  }
  zip.updateFile("word/document.xml", Buffer.from(docXml, "utf8"));

  // Add footer (centered page number, thin top rule)
  const footerXml = buildFooter(cfg.font);
  zip.addFile("word/footer1.xml", Buffer.from(footerXml, "utf8"));

  // Register footer relationship
  let relsXml = zip.readAsText("word/_rels/document.xml.rels");
  if (!relsXml.includes("rIdFooter1")) {
    relsXml = relsXml.replace(
      "</Relationships>",
      `<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" ` +
      `Id="rIdFooter1" Target="footer1.xml"/></Relationships>`
    );
    zip.updateFile("word/_rels/document.xml.rels", Buffer.from(relsXml, "utf8"));
  }

  // Register footer content type
  let ctXml = zip.readAsText("[Content_Types].xml");
  if (!ctXml.includes("footer1.xml")) {
    ctXml = ctXml.replace(
      "</Types>",
      `<Override PartName="/word/footer1.xml" ` +
      `ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`
    );
    zip.updateFile("[Content_Types].xml", Buffer.from(ctXml, "utf8"));
  }

  zip.writeZip(out);
  console.log(`Built: templates/${name}.docx  (${cfg._description ?? ""})`);
}

// ── Style XML builders ────────────────────────────────────────────────────────

function buildStyles(cfg) {
  const { font, bodySize, lineSpacing, paragraphSpaceAfter, justification, headings } = cfg;

  const HEADING_IDS   = ["Heading1","Heading2","Heading3","Heading4","Heading5","Heading6"];
  const HEADING_NAMES = ["heading 1","heading 2","heading 3","heading 4","heading 5","heading 6"];
  const HEADING_NUM_ID = "19"; // from krissen base — do not change

  const styles = {
    Normal: `<w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="${justification}"/>
      <w:spacing w:line="${lineSpacing}" w:lineRule="auto" w:after="${paragraphSpaceAfter}"/>
    </w:pPr>
    ${rpr(font, bodySize)}
  </w:style>`,

    BodyText: `<w:style w:type="paragraph" w:styleId="BodyText">
    <w:name w:val="Body Text"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
  </w:style>`,

    FirstParagraph: `<w:style w:type="paragraph" w:styleId="FirstParagraph">
    <w:name w:val="First Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
  </w:style>`,

    Compact: `<w:style w:type="paragraph" w:styleId="Compact">
    <w:name w:val="Compact"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="${justification}"/>
      <w:spacing w:line="${lineSpacing}" w:lineRule="auto" w:after="0"/>
    </w:pPr>
  </w:style>`,

    BlockText: `<w:style w:type="paragraph" w:styleId="BlockText">
    <w:name w:val="Block Text"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="${justification}"/>
      <w:spacing w:line="${lineSpacing}" w:lineRule="auto" w:after="${paragraphSpaceAfter}"/>
      <w:ind w:left="720" w:right="720"/>
    </w:pPr>
    ${rpr(font, bodySize, false, true)}
  </w:style>`,

    VerbatimChar: `<w:style w:type="character" w:styleId="VerbatimChar">
    <w:name w:val="Verbatim Char"/>
    <w:basedOn w:val="DefaultParagraphFont"/>
    <w:rPr>
      <w:rFonts w:ascii="Courier New" w:hAnsi="Courier New" w:cs="Courier New"/>
      <w:sz w:val="20"/><w:szCs w:val="20"/>
    </w:rPr>
  </w:style>`,

    Title: `<w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:link w:val="TitleChar"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="0" w:after="240"/>
    </w:pPr>
    ${rpr(font, 40, true)}
  </w:style>`,

    Subtitle: `<w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:basedOn w:val="Normal"/>
    <w:link w:val="SubtitleChar"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="0" w:after="200"/>
    </w:pPr>
    ${rpr(font, 28, false, true)}
  </w:style>`,

    Author: `<w:style w:type="paragraph" w:styleId="Author">
    <w:name w:val="Author"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:after="80"/>
    </w:pPr>
    ${rpr(font, bodySize)}
  </w:style>`,
  };

  // Heading styles — preserve numPr pointing to krissen's numId 19
  headings.forEach((h, i) => {
    styles[HEADING_IDS[i]] = `<w:style w:type="paragraph" w:styleId="${HEADING_IDS[i]}">
    <w:name w:val="${HEADING_NAMES[i]}"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="BodyText"/>
    <w:uiPriority w:val="9"/>
    <w:qFormat/>
    <w:pPr>
      <w:numPr>
        <w:ilvl w:val="${i}"/>
        <w:numId w:val="${HEADING_NUM_ID}"/>
      </w:numPr>
      <w:keepNext/>
      <w:keepLines/>
      <w:spacing w:before="${h.spaceBefore}" w:after="${h.spaceAfter}"/>
      <w:outlineLvl w:val="${i}"/>
    </w:pPr>
    ${rpr(font, h.size, h.bold, h.italic)}
  </w:style>`;
  });

  return styles;
}

function rpr(font, size, bold = false, italic = false) {
  return [
    `<w:rPr>`,
    `  <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>`,
    bold   ? `  <w:b/>`  : "",
    italic ? `  <w:i/>`  : "",
    `  <w:sz w:val="${size}"/><w:szCs w:val="${size}"/>`,
    `</w:rPr>`,
  ].filter(Boolean).join("\n    ");
}

function buildFooter(font) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>
        <w:sz w:val="18"/><w:szCs w:val="18"/>
      </w:rPr>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>
        <w:sz w:val="18"/><w:szCs w:val="18"/>
      </w:rPr>
      <w:instrText xml:space="preserve"> PAGE </w:instrText>
    </w:r>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>
        <w:sz w:val="18"/><w:szCs w:val="18"/>
      </w:rPr>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
  </w:p>
</w:ftr>`;
}

function replaceStyle(xml, styleId, newBlock) {
  const pattern = new RegExp(
    `<w:style\\b[^>]*w:styleId="${styleId}"[\\s\\S]*?<\\/w:style>`, "g"
  );
  if (!pattern.test(xml)) {
    return xml.replace("</w:styles>", `  ${newBlock}\n</w:styles>`);
  }
  return xml.replace(
    new RegExp(`<w:style\\b[^>]*w:styleId="${styleId}"[\\s\\S]*?<\\/w:style>`, "g"),
    newBlock
  );
}
