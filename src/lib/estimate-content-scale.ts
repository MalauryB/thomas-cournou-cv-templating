import type { FullCvData } from "./schema";

const CHARS_PER_LINE = 95;
const OVERHEAD_LINES = 8; // logo, info block, référence, accroche, titres de section, footer

function wrappedLines(text: string): number {
  return Math.max(1, Math.ceil(text.length / CHARS_PER_LINE));
}

function estimateLines(data: FullCvData): number {
  let lines = OVERHEAD_LINES;

  for (const exp of data.experiences) {
    lines += wrappedLines(exp.headline);
    for (const line of exp.descriptionLines) lines += wrappedLines(line);
  }

  lines += data.education.reduce((sum, ed) => sum + wrappedLines(ed.headline), 0);

  if (data.tools.length) lines += 1 + wrappedLines(data.tools.join(", "));

  return lines;
}

/**
 * A4 at the base font size comfortably fits ~40 lines; beyond that, shrink
 * proportionally so the whole fiche keeps fitting on a single page.
 */
export function estimateContentScale(data: FullCvData): number {
  const lines = estimateLines(data);
  if (lines <= 40) return 1;
  if (lines >= 65) return 0.78;
  return 1 - ((lines - 40) / (65 - 40)) * 0.22;
}
