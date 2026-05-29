# Document Formatting and Typography

## Introduction

Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, and letter spacing, and adjusting the space between pairs of letters. The term typography is also applied to the style, arrangement, and appearance of the letters, numbers, and symbols created by the process.

Good document typography serves a functional purpose first and foremost. Readers should be able to navigate a document effortlessly, following the hierarchy of headings without conscious effort, and reading body text for extended periods without fatigue. When these goals are achieved, the reader is free to focus entirely on the content rather than the presentation.

## Principles of Readable Body Text

### Line Spacing and Paragraph Rhythm

Line spacing, also called leading, is one of the most influential factors in readability. Too little space between lines causes the reader's eye to accidentally slip onto the wrong line when returning from the end of one line to the beginning of the next. Too much space breaks the visual connection between lines and makes the text feel disjointed, forcing the eye to travel an uncomfortable distance.

The generally accepted range for body text in printed documents is between 1.2 and 1.5 times the font size. For a document set in 11 point type, this translates to approximately 13 to 16.5 points of leading. Academic documents often favour wider spacing to allow for annotations and to signal a formal register, while business documents tend toward tighter spacing to convey efficiency and to fit more content on each page.

Paragraph spacing — the space inserted between paragraphs rather than between lines — is a separate consideration. Some typographers prefer to use only paragraph spacing with no first-line indent, while others use a first-line indent with minimal paragraph spacing. Mixing both is generally considered a mistake, as the visual separation is redundant and wastes vertical space.

### Font Choice and Legibility

The choice between serif and sans-serif typefaces for body text remains one of the oldest debates in typography. Serifs are the small finishing strokes at the ends of letter forms, present in typefaces such as Times New Roman, Cambria, and Georgia. Sans-serif typefaces, such as Calibri, Arial, and Helvetica, lack these strokes entirely.

Conventional wisdom held for many decades that serifs improve legibility in print because they guide the eye along the baseline of the text. More recent research has complicated this picture considerably. Studies conducted on screen reading suggest that the distinction matters far less than was previously assumed, and that familiarity with a typeface plays a larger role than the presence or absence of serifs. What does remain consistent across studies is that extreme typefaces — those with very thin strokes, unusual proportions, or highly stylised letterforms — reliably reduce reading speed regardless of the medium.

For professional documents intended for print, Cambria and Georgia remain strong choices among serif typefaces. Both were designed specifically for high legibility at small sizes and both print cleanly on standard office laser printers. Among sans-serif options, Calibri has become the dominant choice for business documents in recent years, largely through its adoption as the Microsoft Office default, but also because of its genuinely good optical balance at common document sizes.

## Document Structure and Heading Hierarchy

### The Role of Numbered Headings

Numbered headings serve two distinct purposes in a document. The first is navigational: in a long document, numbered headings allow readers to refer to specific sections by number, both internally and in conversation with others. The second is structural: numbering forces the author to commit to a consistent hierarchy and makes structural inconsistencies visible at a glance.

When section 2.3.1 exists but section 2.3 does not, something has clearly gone wrong with the document structure. This kind of error is easy to miss when headings are unnumbered but becomes immediately apparent once numbers are applied. For this reason, applying numbered headings early in the drafting process — rather than as a finishing step — tends to produce better-structured documents overall.

### Heading Size Progression

A well-designed heading hierarchy uses a clear and consistent size progression. The difference between heading levels should be large enough that they are immediately distinguishable without requiring the reader to check the document map, but not so large that lower-level headings feel insignificant or upper-level headings feel theatrical.

A common approach is to use a ratio of roughly 1.2 between adjacent heading levels. Starting from an 11 point body text size, this gives approximately 16 points for the first level, 13 points for the second level, and 12 points for the third level. Below the third level, size alone is often insufficient to signal hierarchy, and weight or style variations — bold, italic, or bold italic — are used instead.

#### A Note on Heading Depth

In practice, documents rarely need more than three levels of heading. When a fourth level is required, it is usually a signal that the document structure needs to be reconsidered rather than extended. A deeply nested heading hierarchy is difficult for readers to track and often indicates that the content would be better reorganised into separate sections or appendices.

## Margins and Page Layout

### Standard Margin Conventions

Margins serve several purposes simultaneously. They provide a visual frame that separates the text from the edge of the page, they create space for binding in printed documents, and they give the reader's thumb a place to hold the page without obscuring the text. For standard A4 documents, margins of 2.5 centimetres on all sides represent a broadly accepted minimum. Wider margins of 3 centimetres or more are appropriate for formal or academic documents and for any document that will be printed and bound.

The asymmetric margin — with a wider inner margin on bound documents to account for the gutter — is a refinement that matters primarily in professionally printed books and reports. For documents that will be read on screen or printed single-sided, symmetric margins are appropriate and simpler to manage.

### Justified versus Ragged-Right Text

Full justification, which aligns text along both the left and right margins, gives a document a formal and polished appearance. It is the standard setting for books, newspapers, and formal reports in most European publishing traditions. The trade-off is that full justification requires careful attention to hyphenation settings. Without automatic hyphenation, the word spacing in justified text can vary dramatically from line to line, creating visually distracting rivers of white space running through the text block.

Ragged-right alignment, which aligns text along the left margin only and leaves the right edge uneven, avoids the word-spacing problem entirely. Each line ends where the last word naturally falls, and spacing between words remains uniform throughout. This is the default for most web text and for informal documents. For professional printed documents, full justification with automatic hyphenation is generally preferred.

## Lists and Tables

### When to Use Lists

Lists are appropriate when presenting genuinely enumerable items that share a common relationship. The following conditions all favour the use of a list over prose:

- The items are discrete and do not require connecting prose to be understood
- There are four or more items that would create an unwieldy sentence if listed inline
- The reader will need to scan or refer back to the items individually
- The sequence of items is significant, in which case a numbered list is appropriate

Lists are frequently overused in business writing. When a document consists primarily of bullet points, the connective logic that links ideas is often lost. A sequence of bullets does not show which items are causes and which are effects, which are more important and which are less, or how the items relate to one another. Prose, used properly, carries this relational information naturally.

### Comparing the Styles

The following table summarises the typographic properties of each available template:

| Template      | Font      | Size  | Line spacing | Margins       |
|---------------|-----------|-------|--------------|---------------|
| professional  | Calibri   | 11 pt | 1.15×        | 2.54 cm all   |
| academic      | Cambria   | 12 pt | 2.0×         | 2.54 cm all   |
| report        | Calibri   | 11 pt | 1.15×        | wider left    |
| minimal       | Georgia   | 11 pt | 1.3×         | 3 cm all      |

## Code and Technical Content

Technical documents often need to include code samples or command-line instructions. These should always be set in a monospace typeface to preserve alignment and to signal clearly that the text is not natural language prose.

Converting a markdown file using the professional style:

```
node convert.js document.md --style professional
```

Listing available templates:

```
node convert.js --styles
```

Rebuilding all templates after editing a style configuration:

```
node make-template.js
```

Inline references to file names, style names, or command flags — such as `convert.js`, `--style`, or `professional.docx` — should also use a monospace typeface to maintain the distinction between code and prose.

> Good writing and good typography share the same goal: to transfer an idea from one mind to another with the least possible friction. Every choice that forces the reader to pause and re-read, or to wonder what was meant, is a failure of both craft and presentation.

## Conclusion

The visual presentation of a document communicates before the first word is read. A document with clear heading hierarchy, consistent spacing, and appropriate typography signals to the reader that the content has been prepared with care. Conversely, inconsistent formatting, poorly chosen typefaces, and crowded or overly sparse spacing all erode the reader's confidence in the content itself, regardless of its quality.

The goal of a good document template is to make the right choices automatic — so that the writer can focus entirely on what they are saying, confident that how it is presented will take care of itself.
