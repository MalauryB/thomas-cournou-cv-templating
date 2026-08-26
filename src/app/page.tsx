"use client";

import { useState, type FormEvent } from "react";

type Result = { fileBaseName: string; docxBase64: string; pdfBase64: string };

function downloadBase64(base64: string, filename: string, mime: string) {
  const bytes = atob(base64);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvText, setCvText] = useState("");
  const [reference, setReference] = useState("");
  const [availability, setAvailability] = useState("");
  const [compensation, setCompensation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("cvFile") as HTMLInputElement;
    const fd = new FormData();
    if (fileInput.files?.[0]) fd.append("cvFile", fileInput.files[0]);
    fd.append("cvText", cvText);
    fd.append("reference", reference);
    fd.append("availability", availability);
    fd.append("compensation", compensation);

    try {
      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la génération.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <main className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-zinc-200">
        <h1 className="text-2xl font-semibold text-zinc-900">Générateur de CV</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fournis un CV (fichier et/ou texte), une référence, une disponibilité et une
          rémunération. L&apos;agent génère un CV mis en forme, téléchargeable en .docx et .pdf.
        </p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              CV source (PDF ou Word)
            </label>
            <div className="mt-1 flex items-center gap-3">
              <label
                htmlFor="cvFile"
                className="cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
              >
                Choisir un fichier
              </label>
              <input
                id="cvFile"
                type="file"
                name="cvFile"
                accept=".pdf,.docx"
                className="hidden"
                onChange={(e) => setCvFileName(e.target.files?.[0]?.name ?? null)}
              />
              <span className="text-sm text-zinc-500">
                {cvFileName ?? "Aucun fichier sélectionné"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Contenu du CV (texte, en complément ou à la place du fichier)
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={6}
              placeholder="Colle ici le contenu du CV si tu n'as pas de fichier propre..."
              className="mt-1 block w-full rounded-lg border border-zinc-300 p-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700">Référence</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="0007740"
                className="mt-1 block w-full rounded-lg border border-zinc-300 p-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Disponibilité</label>
              <input
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Septembre 2026"
                className="mt-1 block w-full rounded-lg border border-zinc-300 p-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700">Rémunération</label>
              <input
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                placeholder="45/50 k€ brut"
                className="mt-1 block w-full rounded-lg border border-zinc-300 p-2 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {loading ? "Génération en cours..." : "Générer le CV"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {result && (
          <div className="mt-8 flex flex-col gap-3 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-700">CV généré avec succès :</p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  downloadBase64(
                    result.docxBase64,
                    `${result.fileBaseName}.docx`,
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  )
                }
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Télécharger .docx
              </button>
              <button
                onClick={() =>
                  downloadBase64(result.pdfBase64, `${result.fileBaseName}.pdf`, "application/pdf")
                }
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Télécharger .pdf
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
