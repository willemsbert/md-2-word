const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "templates");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".docx")).sort();

files.forEach(file => {
  try {
    const zip = new AdmZip(path.join(dir, file));
    const styles = zip.readAsText("word/styles.xml");

    const numbered = [];
    for (let i = 1; i <= 6; i++) {
      // Find the style block for HeadingN
      const start = styles.indexOf(`styleId="Heading${i}"`);
      if (start === -1) continue;
      const end = styles.indexOf("</w:style>", start);
      const block = styles.slice(start, end);
      if (block.includes("numPr")) numbered.push(`H${i}`);
    }

    console.log(file.padEnd(30), numbered.length
      ? `✓ automatic numbering on ${numbered.join(", ")}`
      : `✗ no automatic numbering`
    );
  } catch (e) {
    console.log(file.padEnd(30), `ERROR: ${e.message.slice(0, 60)}`);
  }
});
