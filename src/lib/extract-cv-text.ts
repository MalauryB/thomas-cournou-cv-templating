import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export async function extractCvText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (name.endsWith(".docx") || file.type.includes("wordprocessingml")) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }

  return buffer.toString("utf-8");
}
