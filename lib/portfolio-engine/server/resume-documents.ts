import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { sanitizeMultilineText } from "@/lib/portfolio-engine/sanitize";

export const MAX_RESUME_FILE_SIZE_BYTES = 5_000_000;
export const MAX_RESUME_TEXT_LENGTH = 120_000;

const textMimeTypes = new Set(["text/plain", "text/markdown", "text/x-markdown"]);
const docxMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function extensionFromName(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isPlainTextResume(file: File) {
  const extension = extensionFromName(file.name);
  return textMimeTypes.has(file.type) || extension === "txt" || extension === "md";
}

function isPdfResume(file: File) {
  return file.type === "application/pdf" || extensionFromName(file.name) === "pdf";
}

function isDocxResume(file: File) {
  return file.type === docxMimeType || extensionFromName(file.name) === "docx";
}

export function isSupportedResumeFile(file: File) {
  return isPlainTextResume(file) || isPdfResume(file) || isDocxResume(file);
}

export async function extractResumeText(file: File) {
  if (!isSupportedResumeFile(file)) {
    throw new Error("Upload a TXT, Markdown, PDF, or DOCX resume.");
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    throw new Error("Resume uploads are limited to 5 MB.");
  }

  let text = "";

  if (isPlainTextResume(file)) {
    text = await file.text();
  } else if (isPdfResume(file)) {
    const parser = new PDFParse({ data: new Uint8Array(await file.arrayBuffer()) });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(await file.arrayBuffer()),
    });
    text = result.value;
  }

  const safeText = sanitizeMultilineText(text, MAX_RESUME_TEXT_LENGTH);
  if (!safeText.trim()) {
    throw new Error("Could not extract readable text from that resume.");
  }

  return safeText;
}
