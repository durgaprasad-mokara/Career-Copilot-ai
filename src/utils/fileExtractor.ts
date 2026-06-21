/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from "jszip";

/**
 * Extract text content from various file types
 * Supported: .txt, .docx, and fallback for others.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt') {
    return await file.text();
  }

  if (extension === 'docx') {
    return await extractTextFromDocx(file);
  }

  if (extension === 'pdf') {
    // Elegant fallback: can read as plaintext chars, but since PDF is binary,
    // we notify the client or extract basic text metadata strings.
    // For ultimate bulletproof UX, we inform the candidate that standard PDF extraction is processing,
    // and also provide a manual paste text option as an instant fallback.
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Try a basic extract of standard text sequences in simple PDF streams
      const text = extractTextFromPdfBinary(arrayBuffer);
      if (text.trim().length > 100) {
        return text;
      }
    } catch (e) {
      console.error("PDF basic extract failed:", e);
    }
    throw new Error("PDF text extraction requires copy-pasting resume details into the manual entry window for full structural accuracy.");
  }

  // General text recovery
  return await file.text();
}

/**
 * Extract word text using JSZip by accessing document.xml
 */
async function extractTextFromDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXmlFile = zip.file("word/document.xml");
    
    if (!docXmlFile) {
      throw new Error("Invalid DOCX structure: missing word/document.xml");
    }

    const xmlContent = await docXmlFile.async("string");
    
    // Parse w:t elements which contain word paragraph text sequences
    const textNodes = xmlContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (!textNodes) {
      return "";
    }

    const extracted = textNodes
      .map(node => {
        // Remove XML tags from the string
        return node.replace(/<[^>]+>/g, "");
      })
      .join(" ");

    return extracted;
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to process Word DOCX document. Please ensure it is not password protected.");
  }
}

/**
 * Extractor for standard readable ASCII/UTF-8 words from direct PDF data
 */
function extractTextFromPdfBinary(arrayBuffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(arrayBuffer);
  let binaryString = "";
  // Sample portions to prevent memory spikes
  const step = uint8.length > 500000 ? 2 : 1; 
  for (let i = 0; i < uint8.length; i += step) {
    binaryString += String.fromCharCode(uint8[i]);
  }

  // Regex lookup for literal text strings in PDF format, usually inside parens like: (my text)
  const matches = binaryString.match(/\(([^)]+)\)/g);
  if (!matches) return "";

  const text = matches
    .map(m => m.slice(1, -1).trim())
    .filter(t => t.length > 2 && !t.includes('\\') && /^[a-zA-Z0-9\s,.\-@_]+$/.test(t))
    .join(" ");

  return text;
}
