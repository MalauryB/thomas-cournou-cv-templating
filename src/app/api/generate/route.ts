import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { cvSchema, type FullCvData } from "@/lib/schema";
import { extractCvText } from "@/lib/extract-cv-text";
import { buildDocx } from "@/lib/build-docx";
import { buildPdf } from "@/lib/build-pdf";

export const maxDuration = 60;

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY n'est pas configurée sur le serveur." },
        { status: 500 },
      );
    }

    const form = await req.formData();
    const cvFile = form.get("cvFile");
    const cvText = (form.get("cvText") as string | null) ?? "";
    const reference = (form.get("reference") as string | null) ?? "";
    const availability = (form.get("availability") as string | null) ?? "";
    const compensation = (form.get("compensation") as string | null) ?? "";

    let sourceText = cvText.trim();
    if (cvFile instanceof File && cvFile.size > 0) {
      const extracted = await extractCvText(cvFile);
      sourceText = [sourceText, extracted].filter(Boolean).join("\n\n");
    }

    if (!sourceText) {
      return NextResponse.json(
        { error: "Aucun CV fourni (ni fichier, ni texte)." },
        { status: 400 },
      );
    }

    const { object: cvData } = await generateObject({
      model: openrouter("anthropic/claude-sonnet-5"),
      schema: cvSchema,
      prompt: [
        "Tu es un expert en rédaction de fiches candidat pour un cabinet de placement/recrutement.",
        "À partir du contenu brut de CV ci-dessous, restructure et professionnalise les informations",
        "selon le format attendu du schéma (accroche, expériences avec ligne d'en-tête en gras et",
        "lignes de description sans puces, formations, outils/logiciels, zone de recherche).",
        "Corrige les fautes, clarifie les formulations, et rends les réalisations concrètes et orientées impact.",
        "N'invente aucune expérience, diplôme, outil ou donnée géographique qui ne soit pas déductible du texte source.",
        "Si une information est manquante, laisse le champ vide (chaîne vide ou tableau vide) plutôt que d'inventer.",
        "",
        "Contenu brut du CV :",
        "---",
        sourceText,
        "---",
      ].join("\n"),
    });

    const fullData: FullCvData = { ...cvData, reference, availability, compensation };

    const [docxBuffer, pdfBuffer] = await Promise.all([
      buildDocx(fullData),
      buildPdf(fullData),
    ]);

    const baseName = slugify(fullData.fullName || "cv") || "cv";

    return NextResponse.json({
      fileBaseName: baseName,
      docxBase64: docxBuffer.toString("base64"),
      pdfBase64: pdfBuffer.toString("base64"),
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
