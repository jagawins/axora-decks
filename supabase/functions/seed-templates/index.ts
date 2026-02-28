import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TemplateData {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  is_featured: boolean;
  version?: number;
  default_theme_id?: string;
}

interface TemplateBlockData {
  template_slug: string;
  order_index: number;
  type: string;
  content: Record<string, unknown>;
}

interface SeedData {
  templates: TemplateData[];
  template_blocks: TemplateBlockData[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Verify JWT
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the seed data from the request body
    const seedData: SeedData = await req.json();

    if (!seedData.templates || !seedData.template_blocks) {
      throw new Error("Invalid seed data: missing templates or template_blocks");
    }

    console.log(`Seeding ${seedData.templates.length} templates and ${seedData.template_blocks.length} blocks`);

    // Check for force flag in request body
    const body = await req.clone().json().catch(() => ({}));
    const force = body.force === true;

    // Check if templates already exist
    const { count } = await supabase
      .from("templates")
      .select("*", { count: "exact", head: true });

    if (count && count > 0 && !force) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Templates already seeded. Pass { force: true } to re-seed.",
          templatesCount: count 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If force mode, delete existing data first
    if (force && count && count > 0) {
      console.log("Force mode: deleting existing template data...");
      
      // Delete template_blocks first (FK dependency)
      const { error: deleteBlocksError } = await supabase
        .from("template_blocks")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (deleteBlocksError) {
        console.error("Error deleting template blocks:", deleteBlocksError);
      }

      // Delete template_previews
      const { error: deletePreviewsError } = await supabase
        .from("template_previews")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (deletePreviewsError) {
        console.error("Error deleting template previews:", deletePreviewsError);
      }

      // Delete templates
      const { error: deleteTemplatesError } = await supabase
        .from("templates")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (deleteTemplatesError) {
        console.error("Error deleting templates:", deleteTemplatesError);
        throw new Error(`Failed to delete existing templates: ${deleteTemplatesError.message}`);
      }

      console.log("Existing template data cleared");
    }

    // Insert templates
    const { data: insertedTemplates, error: templatesError } = await supabase
      .from("templates")
      .insert(seedData.templates)
      .select();

    if (templatesError) {
      console.error("Error inserting templates:", templatesError);
      throw new Error(`Failed to insert templates: ${templatesError.message}`);
    }

    console.log(`Inserted ${insertedTemplates?.length || 0} templates`);

    // Create a map of slug -> template id
    const slugToId: Record<string, string> = {};
    insertedTemplates?.forEach((t) => {
      slugToId[t.slug] = t.id;
    });

    // Map template_blocks to include template_id and new schema fields
    const blocksWithIds = seedData.template_blocks
      .filter((block) => slugToId[block.template_slug])
      .map((block) => ({
        template_id: slugToId[block.template_slug],
        type: block.type,
        content: block.content,
        block_payload: block.content, // New field - same as content for migration
        block_meta: {}, // Empty metadata for seeded templates
        order_index: block.order_index,
      }));

    console.log(`Preparing to insert ${blocksWithIds.length} blocks`);

    // Insert blocks in batches of 100 to avoid payload limits
    const BATCH_SIZE = 100;
    let insertedBlocksCount = 0;

    for (let i = 0; i < blocksWithIds.length; i += BATCH_SIZE) {
      const batch = blocksWithIds.slice(i, i + BATCH_SIZE);
      const { error: blocksError } = await supabase
        .from("template_blocks")
        .insert(batch);

      if (blocksError) {
        console.error(`Error inserting blocks batch ${i / BATCH_SIZE}:`, blocksError);
        throw new Error(`Failed to insert template blocks: ${blocksError.message}`);
      }

      insertedBlocksCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}, total blocks: ${insertedBlocksCount}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Templates seeded successfully",
        templatesCount: insertedTemplates?.length || 0,
        blocksCount: insertedBlocksCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
