// extractPDF.js
export async function extractPDFText(path) {
  const fs = await import("fs/promises");
  const pdf = (await import("pdf-parse")).default;

  const buffer = await fs.readFile(path);
  const data = await pdf(buffer);
  return data.text;
}
