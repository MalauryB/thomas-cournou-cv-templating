import { z } from "zod";

export const cvSchema = z.object({
  fullName: z.string().describe("Nom complet du candidat"),
  email: z.string().describe("Email de contact, chaîne vide si absent"),
  phone: z.string().describe("Téléphone de contact, chaîne vide si absent"),
  jobTitle: z
    .string()
    .describe(
      "Accroche professionnelle combinant le poste et l'expérience, ex: " +
        "\"Collaborateur Comptable Confirmé - 9 ans d'expérience acquise en Cabinet\". " +
        "Ne pas inventer un nombre d'années si non déductible du CV source.",
    ),
  searchZone: z
    .string()
    .describe(
      "Zone géographique de recherche et informations de mobilité (permis, véhicule) " +
        "telles que mentionnées dans le CV source, ex: " +
        "\"Yvelines – Versailles, Plaisir, Trappes, Perray en Yvelines. Permis B, véhiculé\". " +
        "Chaîne vide si aucune information de localisation/mobilité n'est présente dans le CV.",
    ),
  experiences: z
    .array(
      z.object({
        headline: z
          .string()
          .describe(
            "Ligne d'en-tête en gras de l'expérience, ex: " +
              "\"2024-2026  Collaborateur Comptable Confirmé – Cabinet d'expertise comptable (CDI)\". " +
              "Inclut la période, le poste, l'entreprise (ou son type si le nom n'est pas public) et le type de contrat si connu.",
          ),
        descriptionLines: z
          .array(z.string())
          .describe(
            "Lignes de description des missions/réalisations, en texte simple (pas de puces), " +
              "formulées en phrases courtes et concrètes.",
          ),
      }),
    )
    .describe("Expériences professionnelles, de la plus récente à la plus ancienne"),
  education: z
    .array(
      z.object({
        headline: z
          .string()
          .describe("Ligne de formation en gras, ex: \"2025  MASTER CCA (Candidat Libre)\""),
      }),
    )
    .describe("Formations"),
  tools: z
    .array(z.string())
    .describe("Logiciels et outils maîtrisés, tels que mentionnés ou déductibles du CV source"),
});

export type CvData = z.infer<typeof cvSchema>;

export const missionSchema = z.object({
  reference: z.string(),
  availability: z.string(),
  compensation: z.string(),
});

export type MissionData = z.infer<typeof missionSchema>;

export type FullCvData = CvData & MissionData;
