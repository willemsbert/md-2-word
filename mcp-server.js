#!/usr/bin/env node
"use strict";

const { Server }              = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");

const { execSync } = require("child_process");
const fs   = require("fs");
const os   = require("os");
const path = require("path");

const TEMPLATES_DIR = path.join(__dirname, "templates");

function listStyles() {
  return fs
    .readdirSync(TEMPLATES_DIR)
    .filter(f => f.endsWith(".docx"))
    .map(f => f.replace(".docx", ""))
    .sort();
}

function convertToWord(markdown, style, templatePath) {
  const tmpDir    = fs.mkdtempSync(path.join(os.tmpdir(), "md2word-"));
  const inputFile = path.join(tmpDir, "input.md");
  const outFile   = path.join(tmpDir, "output.docx");

  try {
    fs.writeFileSync(inputFile, markdown, "utf8");

    let refDoc;
    if (templatePath) {
      refDoc = path.resolve(templatePath);
      if (!fs.existsSync(refDoc)) throw new Error(`Template not found: ${templatePath}`);
    } else {
      const s = style || "professional";
      refDoc = path.join(TEMPLATES_DIR, `${s}.docx`);
      if (!fs.existsSync(refDoc)) {
        throw new Error(
          `Style "${s}" not found. Available styles: ${listStyles().join(", ")}`
        );
      }
    }

    execSync(
      `pandoc "${inputFile}" -o "${outFile}" --reference-doc="${refDoc}"`,
      { stdio: "pipe" }
    );

    return fs.readFileSync(outFile).toString("base64");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// ── Server ────────────────────────────────────────────────────────────────────

const server = new Server(
  { name: "md-2-word", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "convert_to_word",
      description:
        "Convert Markdown text to a Word (.docx) file. " +
        "Returns the document as a base64-encoded blob.",
      inputSchema: {
        type: "object",
        properties: {
          markdown: {
            type: "string",
            description: "Markdown content to convert.",
          },
          style: {
            type: "string",
            enum: listStyles(),
            description:
              "Style template to use (default: professional). " +
              "Call list_styles to see all options.",
          },
        },
        required: ["markdown"],
      },
    },
    {
      name: "list_styles",
      description: "List available Word style templates.",
      inputSchema: { type: "object", properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  if (name === "list_styles") {
    const styles = listStyles();
    return {
      content: [
        {
          type: "text",
          text: `Available styles:\n${styles.map(s => `  - ${s}`).join("\n")}`,
        },
      ],
    };
  }

  if (name === "convert_to_word") {
    const { markdown, style } = args;
    if (typeof markdown !== "string" || !markdown.trim()) {
      return {
        content: [{ type: "text", text: "Error: markdown must be a non-empty string." }],
        isError: true,
      };
    }

    let blob;
    try {
      blob = convertToWord(markdown, style);
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error: ${err.message}` }],
        isError: true,
      };
    }

    const dataUri =
      "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document" +
      `;base64,${blob}`;

    return {
      content: [
        {
          type: "resource",
          resource: {
            uri: dataUri,
            mimeType:
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            blob,
          },
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

// ── Start ─────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
