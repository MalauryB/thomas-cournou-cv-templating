import type { CvData } from "./schema";

const MAX_EXPERIENCES = 5;
const MAX_DESCRIPTION_LINES = 4;
const MAX_EDUCATION = 3;
const MAX_TOOLS = 12;
const MAX_HEADLINE_CHARS = 150;
const MAX_DESCRIPTION_CHARS = 200;

function clampText(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/**
 * The model is guided (via schema descriptions/prompt) to stay within these
 * bounds so the fiche fits one page, but LLMs don't reliably self-enforce
 * exact counts/lengths. Rejecting the whole generation on a minor overage
 * is fragile, so we deterministically clamp here instead.
 */
export function clampCvData(data: CvData): CvData {
  return {
    ...data,
    experiences: data.experiences.slice(0, MAX_EXPERIENCES).map((exp) => ({
      headline: clampText(exp.headline, MAX_HEADLINE_CHARS),
      descriptionLines: exp.descriptionLines
        .slice(0, MAX_DESCRIPTION_LINES)
        .map((line) => clampText(line, MAX_DESCRIPTION_CHARS)),
    })),
    education: data.education.slice(0, MAX_EDUCATION).map((ed) => ({
      headline: clampText(ed.headline, MAX_HEADLINE_CHARS),
    })),
    tools: data.tools.slice(0, MAX_TOOLS),
  };
}
