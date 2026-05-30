Convert a file to Markdown and save it as a .md file next to the original.

Usage: /convert-pdf path/to/file

Steps:
1. If $ARGUMENTS is empty, ask the user for the file path.
2. Check that the file exists. If not, tell the user and stop.
3. Determine the output path: same directory and name as the input, with .md extension.
   Example: /docs/report.pdf → /docs/report.md
4. Try markitdown first:
   Run: markitdown "$ARGUMENTS" -o "<output_path>"
5. If markitdown fails AND the file ends in .pdf, fall back to pymupdf:
   Run this bash command:
   python3 -c "
import fitz, sys
doc = fitz.open(sys.argv[1])
out = open(sys.argv[2], 'w')
for i, page in enumerate(doc):
    out.write(f'## Page {i+1}\n\n')
    out.write(page.get_text())
    out.write('\n\n')
out.close()
" "$ARGUMENTS" "<output_path>"
6. Tell the user the output was saved to <output_path>.
7. If both fail, tell the user to run: pip install cffi "markitdown[pdf]" pymupdf
