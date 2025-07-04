export async function extractPDFText(path: string) {
  const { parseOfficeAsync } = await import("officeparser");
  const text = await parseOfficeAsync(path);
  return text;
}
