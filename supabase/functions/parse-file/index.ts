import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { unzipSync, strFromU8 } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_TEXT_LENGTH = 200; // Fallback to AI if less than this
const PDF_REQUIRES_AI = true; // PDFs always use AI extraction

interface ParseResult {
  text: string;
  meta: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    wordCount: number;
  };
}

function extractDocxText(arrayBuffer: ArrayBuffer): string {
  // DOCX is a ZIP file - use fflate for decompression
  const data = new Uint8Array(arrayBuffer);
  const unzipped = unzipSync(data);
  
  const documentXmlBytes = unzipped["word/document.xml"];
  if (!documentXmlBytes) {
    throw new Error("Invalid DOCX file: missing document.xml");
  }
  
  const documentXml = strFromU8(documentXmlBytes);

  // Extract text content from XML
  const text = documentXml
    .replace(/<w:p[^>]*>/g, "\n") // Paragraph breaks
    .replace(/<w:br[^>]*>/g, "\n") // Line breaks
    .replace(/<w:tab[^>]*>/g, "\t") // Tabs
    .replace(/<[^>]+>/g, "") // Remove all XML tags
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/\n /g, "\n") // Clean up newlines
    .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
    .trim();

  return text;
}

async function extractWithAI(arrayBuffer: ArrayBuffer, mimeType: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    throw new Error("AI service not configured");
  }

  // Convert to base64 in chunks to avoid stack overflow
  const bytes = new Uint8Array(arrayBuffer);
  let base64 = "";
  const chunkSize = 32768;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    base64 += btoa(String.fromCharCode.apply(null, Array.from(chunk)));
  }
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract ALL text content from this document. Preserve the original structure. Return only the extracted text, no additional commentary."
            },
            {
              type: "file",
              file: { url: dataUrl }
            }
          ]
        }
      ],
      max_tokens: 16000,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI extraction failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided", requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File too large. Maximum size is 10MB.", requestId }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileName = file.name;
    const fileType = fileName.split(".").pop()?.toLowerCase() || "";

    console.log(`[${requestId}] Parsing file: ${fileName} (${fileType}, ${(file.size / 1024).toFixed(1)}KB)`);

    let text = "";

    if (fileType === "txt" || fileType === "md") {
      // Plain text files - read directly
      text = await file.text();
    } else if (fileType === "pdf") {
      // PDF parsing - always use AI extraction (no good Deno-native PDF parser)
      console.log(`[${requestId}] PDF file detected, using AI extraction`);
      const arrayBuffer = await file.arrayBuffer();
      text = await extractWithAI(arrayBuffer, "application/pdf");
    } else if (fileType === "docx") {
      // DOCX parsing using fflate (deterministic)
      const arrayBuffer = await file.arrayBuffer();
      try {
        text = extractDocxText(arrayBuffer);
      } catch (docxError) {
        console.log(`[${requestId}] DOCX parsing failed, falling back to AI:`, docxError);
        text = await extractWithAI(arrayBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      }

      // Fallback to AI if text is too short
      if (text.trim().length < MIN_TEXT_LENGTH) {
        console.log(`[${requestId}] DOCX text too short (${text.trim().length} chars), falling back to AI`);
        text = await extractWithAI(arrayBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      }
    } else {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${fileType}`, requestId }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate word count
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    const result: ParseResult = {
      text,
      meta: {
        fileName,
        fileType,
        wordCount,
      },
    };

    console.log(`[${requestId}] Extracted ${wordCount} words from ${fileName}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[${requestId}] Unexpected error:`, error);
    return new Response(
      JSON.stringify({ error: "Failed to parse file", requestId }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
