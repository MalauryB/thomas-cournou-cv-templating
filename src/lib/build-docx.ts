import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
} from "docx";
import type { FullCvData } from "./schema";

const ISSUER_NAME = "Thomas Cournou";
const AGENCY_NAME = "AKXIO CONSEILS";
const ISSUER_PHONE = "06 06 42 89 26";
const ISSUER_EMAIL = "t.cournou@akxioconseils.fr";
const BRAND_BLUE = "2E6DA4";

function centered(children: TextRun[], spacingAfter = 0) {
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: spacingAfter }, children });
}

function sectionHeading(text: string) {
  return new Paragraph({
    spacing: { before: 260, after: 100 },
    children: [new TextRun({ text, bold: true, color: BRAND_BLUE, size: 22 })],
  });
}

export async function buildDocx(data: FullCvData): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    centered([
      new TextRun({ text: "AKXIO", bold: true, size: 44, color: BRAND_BLUE, characterSpacing: 120 }),
    ]),
    centered(
      [
        new TextRun({ text: "CONSEILS", bold: true, size: 20, color: BRAND_BLUE, characterSpacing: 180 }),
      ],
      260,
    ),

    centered([new TextRun({ text: `Disponibilité : ${data.availability || "—"}`, size: 20 })]),
    centered([new TextRun({ text: `Rémunération cible : ${data.compensation || "—"}`, size: 20 })]),
    ...(data.searchZone
      ? [centered([new TextRun({ text: `Zone de recherche : ${data.searchZone}`, size: 20 })], 200)]
      : [new Paragraph({ spacing: { after: 200 }, children: [] })]),

    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: `Référence : ${data.reference || "—"}`, size: 20 })],
    }),

    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: data.jobTitle, bold: true, size: 24 })],
    }),

    sectionHeading("EXPÉRIENCES"),
  );

  data.experiences.forEach((exp, i) => {
    children.push(
      new Paragraph({
        spacing: { before: i === 0 ? 0 : 200 },
        children: [new TextRun({ text: exp.headline, bold: true, size: 20 })],
      }),
      ...exp.descriptionLines.map(
        (line) => new Paragraph({ children: [new TextRun({ text: line, size: 20 })] }),
      ),
    );
  });

  children.push(sectionHeading("FORMATIONS"));
  data.education.forEach((ed) => {
    children.push(
      new Paragraph({ children: [new TextRun({ text: ed.headline, bold: true, size: 20 })] }),
    );
  });

  if (data.tools.length) {
    children.push(
      new Paragraph({
        spacing: { before: 320, after: 60 },
        children: [new TextRun({ text: "Logiciel :", bold: true, size: 20 })],
      }),
      new Paragraph({ children: [new TextRun({ text: data.tools.join(", "), size: 20 })] }),
    );
  }

  children.push(
    new Paragraph({ spacing: { before: 480 }, children: [] }),
    centered([
      new TextRun({
        text: `${ISSUER_NAME} – ${AGENCY_NAME} – ${ISSUER_PHONE}`,
        size: 18,
        color: "555555",
      }),
    ]),
    centered([new TextRun({ text: ISSUER_EMAIL, size: 18, color: "555555" })]),
  );

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 700, bottom: 700, left: 900, right: 900 } } },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
