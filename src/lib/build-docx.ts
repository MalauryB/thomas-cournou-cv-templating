import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
} from "docx";
import type { FullCvData } from "./schema";
import { estimateContentScale } from "./estimate-content-scale";
import { LOGO_BUFFER, LOGO_ASPECT_RATIO } from "./logo";

const ISSUER_NAME = "Thomas Cournou";
const AGENCY_NAME = "AKXIO CONSEILS";
const ISSUER_PHONE = "06 06 42 89 26";
const ISSUER_EMAIL = "t.cournou@akxioconseils.fr";
const BRAND_BLUE = "2E6DA4";

export async function buildDocx(data: FullCvData): Promise<Buffer> {
  const scale = estimateContentScale(data);
  const sz = (n: number) => Math.round(n * scale);
  const sp = (n: number) => Math.round(n * scale);
  const margin = Math.round(700 + (1 - scale) * 400);

  function centered(children: TextRun[], spacingAfter = 0) {
    return new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: sp(spacingAfter) },
      children,
    });
  }

  function sectionHeading(text: string) {
    return new Paragraph({
      spacing: { before: sp(260), after: sp(100) },
      children: [new TextRun({ text, bold: true, color: BRAND_BLUE, size: sz(22) })],
    });
  }

  const children: Paragraph[] = [];

  const logoWidth = Math.round(240 * scale);
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: sp(260) },
      children: [
        new ImageRun({
          type: "png",
          data: LOGO_BUFFER,
          transformation: { width: logoWidth, height: Math.round(logoWidth / LOGO_ASPECT_RATIO) },
        }),
      ],
    }),

    centered([new TextRun({ text: `Disponibilité : ${data.availability || "—"}`, size: sz(20) })]),
    centered([
      new TextRun({ text: `Rémunération cible : ${data.compensation || "—"}`, size: sz(20) }),
    ]),
    ...(data.searchZone
      ? [
          centered(
            [new TextRun({ text: `Zone de recherche : ${data.searchZone}`, size: sz(20) })],
            200,
          ),
        ]
      : [new Paragraph({ spacing: { after: sp(200) }, children: [] })]),

    new Paragraph({
      spacing: { after: sp(200) },
      children: [new TextRun({ text: `Référence : ${data.reference || "—"}`, size: sz(20) })],
    }),

    new Paragraph({
      spacing: { after: sp(100) },
      children: [new TextRun({ text: data.jobTitle, bold: true, size: sz(24) })],
    }),

    sectionHeading("EXPÉRIENCES"),
  );

  data.experiences.forEach((exp, i) => {
    children.push(
      new Paragraph({
        spacing: { before: i === 0 ? 0 : sp(200) },
        children: [new TextRun({ text: exp.headline, bold: true, size: sz(20) })],
      }),
      ...exp.descriptionLines.map(
        (line) => new Paragraph({ children: [new TextRun({ text: line, size: sz(20) })] }),
      ),
    );
  });

  children.push(sectionHeading("FORMATIONS"));
  data.education.forEach((ed) => {
    children.push(
      new Paragraph({ children: [new TextRun({ text: ed.headline, bold: true, size: sz(20) })] }),
    );
  });

  if (data.tools.length) {
    children.push(
      new Paragraph({
        spacing: { before: sp(320), after: sp(60) },
        children: [new TextRun({ text: "Logiciel :", bold: true, size: sz(20) })],
      }),
      new Paragraph({
        children: [new TextRun({ text: data.tools.join(", "), size: sz(20) })],
      }),
    );
  }

  children.push(
    new Paragraph({ spacing: { before: sp(480) }, children: [] }),
    centered([
      new TextRun({
        text: `${ISSUER_NAME} – ${AGENCY_NAME} – ${ISSUER_PHONE}`,
        size: sz(18),
        color: "555555",
      }),
    ]),
    centered([new TextRun({ text: ISSUER_EMAIL, size: sz(18), color: "555555" })]),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: margin, bottom: margin, left: margin + 200, right: margin + 200 } },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
