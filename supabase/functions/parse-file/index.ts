import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ParseResult {
  text: string;
  meta: {
    fileName: string;
    fileType: string;
    pageCount?: number;
    wordCount: number;
  };
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

    const fileName = file.name;
    const fileType = fileName.split(".").pop()?.toLowerCase() || "";

    console.log(`[${requestId}] Parsing file: ${fileName} (${fileType})`);

    let text = "";

    if (fileType === "txt" || fileType === "md") {
      // Plain text files - read directly
      text = await file.text();
    } else if (fileType === "pdf") {
      // PDF parsing using AI extraction
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "AI service not configured", requestId }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:application/pdf;base64,${base64}`;

      // Use vision model to extract text from PDF
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
                  text: "Extract ALL text content from this PDF document. Preserve the original structure and formatting as much as possible. Return only the extracted text, no additional commentary."
                },
                {
                  type: "image_url",
                  image_url: { url: dataUrl }
                }
              ]
            }
          ],
          max_tokens: 16000,
        }),
      });

      if (!response.ok) {
        console.error(`[${requestId}] AI extraction failed: ${response.status}`);
        return new Response(
          JSON.stringify({ error: "Failed to extract text from PDF", requestId }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      text = data.choices?.[0]?.message?.content || "";
      
    } else if (fileType === "docx") {
      // DOCX parsing using AI
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "AI service not configured", requestId }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const dataUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`;

      // Use vision model to extract text
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
                  text: "Extract ALL text content from this Word document. Preserve the original structure and formatting as much as possible. Return only the extracted text, no additional commentary."
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
        console.error(`[${requestId}] AI extraction failed: ${response.status}`);
        return new Response(
          JSON.stringify({ error: "Failed to extract text from DOCX", requestId }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      text = data.choices?.[0]?.message?.content || "";
      
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
