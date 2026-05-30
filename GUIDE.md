# How This Project Works — A Complete Guide

This guide explains everything that was built, what each piece does, and how to set it up on different devices. It assumes no prior knowledge of MCP servers or Claude Code skills.

---

## What was built

This project does two things:

| Conversion | Tool used | How to trigger |
|---|---|---|
| PDF / Word / PowerPoint → Markdown | `markitdown` (Python) | `/convert-pdf` skill |
| Markdown → Word (.docx) | `pandoc` | `node convert.js` or MCP server |

Together they form a full pipeline:

```
PDF  ──►  /convert-pdf  ──►  document.md  ──►  node convert.js  ──►  document.docx
```

---

## Key concepts (explained simply)

### Claude Code
A tool from Anthropic that lets Claude help with code and files. It runs in:
- A terminal (type `claude`)
- VS Code (install the Claude Code extension)
- The built-in terminal inside Claude Desktop
- A browser at claude.ai/code

### Skills (slash commands)
A skill is a shortcut you type in a Claude Code session. This project adds `/convert-pdf`. When you type it, Claude runs the conversion for you.

Skills are stored as `.md` files in `.claude/commands/`. Files in this project's `.claude/commands/` are available whenever you open this project in Claude Code.

### MCP server
An MCP (Model Context Protocol) server is a background process that Claude Desktop can call as a tool *automatically* during a conversation — without you typing a command. This project's MCP server (`mcp-server.js`) exposes `convert_to_word` so Claude Desktop can produce Word documents on its own when asked.

### Session-start hook
A command that runs automatically every time a Claude Code session starts in this project. The hook in `.claude/settings.json` silently installs the Python dependencies needed by `/convert-pdf`.

---

## Where each feature works

| Environment | `/convert-pdf` skill | MCP server (`convert_to_word`) |
|---|---|---|
| **Claude Desktop** — built-in terminal | ✅ Works | ✅ Configure once (see below) |
| **VS Code** — Claude Code extension | ✅ Works | ❌ Not supported |
| **Terminal** — `claude` CLI | ✅ Works | ❌ Not supported |
| **Browser** — claude.ai/code | ✅ Works (hook installs deps automatically) | ❌ Not supported |
| **Claude.ai** — browser chat, no Code | ❌ No skills | ❌ No MCP |
| **Claude mobile app** (iOS / Android) | ❌ No skills | ❌ No MCP |
| **Android via Remote Control** | ✅ Uses your desktop's session | ✅ Uses your desktop's session |

**Remote Control** (`/rc` in Claude Code): Start a session on your desktop, type `/rc` to get a QR code, scan it with the Claude mobile app. Your phone then controls your desktop session — all tools and skills work from your phone.

---

## Setup

### Step 1 — Install system requirements (once per machine)

```bash
# Node.js 18+ and pandoc 3+ are required
# On macOS:
brew install pandoc node

# On Windows: download from pandoc.org and nodejs.org

# Python (for /convert-pdf):
pip install cffi "markitdown[pdf]" pymupdf
```

### Step 2 — Clone and install

```bash
git clone https://github.com/willemsbert/md-2-word.git
cd md-2-word
npm install
```

### Step 3 — Set up MCP server in Claude Desktop (optional)

Only needed if you use the Claude Desktop app and want Claude to produce Word documents automatically.

Find your Claude Desktop config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this (replace the path with where you cloned the repo):

```json
{
  "mcpServers": {
    "md-2-word": {
      "command": "node",
      "args": ["/absolute/path/to/md-2-word/mcp-server.js"]
    }
  }
}
```

Restart Claude Desktop. You should see `md-2-word` listed under tools.

---

## Using `/convert-pdf`

In any Claude Code session (VS Code, terminal, browser, Claude Desktop terminal):

```
/convert-pdf /path/to/document.pdf
```

This saves `document.md` next to the original file. You can then:
- Read it in Claude (far fewer tokens than the raw PDF)
- Convert it to Word: `node convert.js document.md`

Supported input formats: PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), HTML, images (with OCR), audio (with transcription).

---

## Using `node convert.js` (Markdown → Word)

```bash
node convert.js document.md                    # uses 'professional' style
node convert.js document.md --style academic   # other styles: academic, report, minimal
node convert.js --styles                       # list all available styles
```

Output is written next to the source file (`document.docx`).

---

## Using the MCP server (Claude Desktop only)

Once configured, just ask Claude naturally:

> "Convert this Markdown to a Word document using the report style"
> "List the available Word styles"

Claude will call `convert_to_word` or `list_styles` automatically.

---

## Testing that everything works

### Test `/convert-pdf`

1. Open this project in Claude Code (VS Code or terminal)
2. Use a real PDF file (e.g. one from your Downloads folder)
3. Type: `/convert-pdf /path/to/your.pdf`
4. Expected: a `.md` file is created next to the PDF

### Test `node convert.js`

```bash
node convert.js examples/example.md
# Expected: examples/example.docx is created
```

### Test the MCP server (Claude Desktop)

1. Ensure the server is configured in `claude_desktop_config.json`
2. Open Claude Desktop → start a new conversation
3. Ask: "List the available Word styles"
4. Expected: Claude responds with `academic`, `minimal`, `professional`, `report`

### Test the session-start hook (browser)

1. Open this project in claude.ai/code
2. Run: `pip show markitdown`
3. Expected: markitdown is already installed (hook ran at session start)

---

## File reference

```
md-2-word/
├── convert.js              # CLI: Markdown → Word
├── mcp-server.js           # MCP server: exposes convert_to_word tool
├── make-template.js        # Rebuild Word style templates
├── check-templates.js      # Inspect templates
├── base.docx               # Base Word template
├── templates/              # Generated style templates (.docx)
├── styles/                 # Style config files (.json)
├── examples/               # Example Markdown and output files
├── README.md               # Project overview
├── GUIDE.md                # This file
└── .claude/
    ├── settings.json       # Session-start hook (installs markitdown)
    └── commands/
        └── convert-pdf.md  # /convert-pdf skill definition
```

---

## Troubleshooting

**`/convert-pdf` says markitdown not found**
```bash
pip install cffi "markitdown[pdf]" pymupdf
```

**`node convert.js` fails with "pandoc not found"**
Install pandoc 3+: https://pandoc.org/installing.html

**MCP server not showing in Claude Desktop**
- Check the path in `claude_desktop_config.json` is absolute and correct
- Restart Claude Desktop completely
- Run `node mcp-server.js` in a terminal to check for errors

**`markitdown[pdf]` installs but crashes on PDF**
The `cryptography` system package may be missing `cffi`. Fix:
```bash
pip install cffi
```
