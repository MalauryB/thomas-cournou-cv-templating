# Générateur de CV

App Next.js : à partir d'un CV (fichier PDF/Word et/ou texte) plus une référence, une disponibilité
et une rémunération, un agent IA restructure le CV et génère un document mis en forme,
téléchargeable en `.docx` et en `.pdf`.

## Fonctionnement

1. `src/app/page.tsx` — formulaire (upload CV + champs référence / disponibilité / rémunération).
2. `src/app/api/generate/route.ts` — orchestration serveur :
   - extraction du texte du CV (`src/lib/extract-cv-text.ts`, via `pdf-parse` / `mammoth`) ;
   - structuration du contenu par un modèle IA (`generateObject` avec le schéma `src/lib/schema.ts`) ;
   - génération du `.docx` (`src/lib/build-docx.ts`) et du `.pdf` (`src/lib/build-pdf.tsx`), tous
     deux construits à partir des mêmes données pour rester visuellement cohérents.

Le design du CV (bandeau référence/dispo/rémunération, sections résumé/expérience/compétences/
formation/langues) est défini dans le code de `build-docx.ts` et `build-pdf.tsx` — à adapter si un
gabarit graphique spécifique doit être respecté.

## Configuration requise

Le modèle IA passe directement par [OpenRouter](https://openrouter.ai) (`ai` + `@openrouter/ai-sdk-provider`).
Renseigne ta clé dans `.env.local` (déjà présent, non versionné) :

```bash
OPENROUTER_API_KEY=sk-or-...
```

Le modèle utilisé est `anthropic/claude-sonnet-5` (défini dans
`src/app/api/generate/route.ts`) — à changer pour n'importe quel autre modèle du catalogue
OpenRouter si besoin.

## Démarrer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Déploiement

```bash
vercel deploy        # preview
vercel deploy --prod # production
```
