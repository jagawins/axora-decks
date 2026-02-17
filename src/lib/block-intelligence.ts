/**
 * Block Intelligence Layer
 * Stores metadata for each block: purpose, position, clarity score, recommendations
 */

import { BlockType, Block, VisualBlockType, isBasicBlockType } from "./blocks";
import { getBlockIcon } from "./block-icons";

// Re-export getBlockIcon for convenience
export { getBlockIcon };

// Executive block purposes for intelligent categorization
export type BlockPurpose = 
  | "summary"      // Key takeaway or executive summary
  | "problem"      // Problem statement or challenge
  | "insight"      // Data-driven insight or finding
  | "proof"        // Evidence, data, or supporting material
  | "action"       // Call to action or next steps
  | "context"      // Background information
  | "transition"   // Connecting narrative between sections
  | "visual"       // Visual element (chart, image, diagram)
  | "decision"     // Decision-making content
  | "unknown";     // Unclassified

export interface BlockMetadata {
  purpose: BlockPurpose;
  clarityScore: number;        // 0-100, how clear/impactful the block is
  recommendedPosition: number; // Suggested order in the deck
  recommendations: string[];   // Improvement suggestions
  executiveWeight: number;     // 0-10, importance for exec audience
  wordCount: number;
  readTime: number;            // Seconds to read/present
}

export interface IntelligentBlock extends Block {
  metadata: BlockMetadata;
}

// Clarity scoring weights
const CLARITY_WEIGHTS = {
  conciseness: 0.25,
  actionability: 0.25,
  specificity: 0.25,
  structure: 0.25,
};

// Visual block type → purpose mapping (hardcoded for deterministic behavior)
const VISUAL_BLOCK_PURPOSE_MAP: Record<VisualBlockType, BlockPurpose> = {
  stat_block: "proof",
  quote_block: "proof",
  timeline_block: "context",
  comparison_table: "decision",
  card_grid: "insight",
  hero_header: "transition",
  exec_summary: "summary",
  cta_section: "action",
  section_divider: "transition",
  icon_text_block: "insight",
  framed_insight: "insight",
  three_pillars: "insight",
  two_by_two_matrix: "decision",
  decision_next_steps: "action",
};

// Purpose detection patterns for basic blocks
const PURPOSE_PATTERNS: Record<BlockPurpose, RegExp[]> = {
  summary: [
    /\b(summary|overview|takeaway|key point|in short|bottom line|tldr|executive summary)\b/i,
    /\b(in conclusion|to summarize|the main|highlights?)\b/i,
  ],
  problem: [
    /\b(problem|challenge|issue|obstacle|pain point|difficulty|struggle|barrier)\b/i,
    /\b(facing|confronting|dealing with|experiencing)\b/i,
  ],
  insight: [
    /\b(insight|finding|discovery|revealed|shows?|indicates?|suggests?|data shows)\b/i,
    /\b(analysis|trend|pattern|observation)\b/i,
  ],
  proof: [
    /\b(evidence|data|statistics?|research|study|survey|report|metrics?)\b/i,
    /\b(\d+%|\d+x|percent|increase|decrease|growth)\b/i,
  ],
  action: [
    /\b(action|next steps?|recommend|should|must|need to|call to action|implement)\b/i,
    /\b(plan|strategy|roadmap|timeline|deliverables?)\b/i,
  ],
  context: [
    /\b(background|context|history|overview|introduction|about)\b/i,
    /\b(currently|traditionally|historically)\b/i,
  ],
  transition: [
    /\b(moving on|next|now let's|turning to|speaking of|regarding)\b/i,
    /\b(before we|after this|following)\b/i,
  ],
  visual: [
    /\b(chart|graph|diagram|figure|image|illustration|visualization)\b/i,
  ],
  decision: [
    /\b(decide|decision|choose|option|alternative|recommend)\b/i,
    /\b(pros? and cons?|compare|versus|vs\.?)\b/i,
  ],
  unknown: [],
};

// Position recommendations by purpose
const POSITION_WEIGHTS: Record<BlockPurpose, number> = {
  summary: 1,      // Start with summary
  problem: 2,      // Define the problem early
  context: 3,      // Provide background
  insight: 4,      // Share findings
  proof: 5,        // Back up with data
  visual: 6,       // Visualize the data
  decision: 6,     // Decision-making typically mid-deck
  action: 7,       // End with actions
  transition: 0,   // Flexible positioning
  unknown: 5,      // Middle of deck
};

/**
 * Extract text content from any block type
 */
function extractBlockText(block: Block): string {
  const content = block.content;
  const parts: string[] = [];
  
  if (typeof content.text === "string") parts.push(content.text);
  if (typeof content.left === "string") parts.push(content.left);
  if (typeof content.right === "string") parts.push(content.right);
  if (typeof content.caption === "string") parts.push(content.caption);
  if (typeof content.alt === "string") parts.push(content.alt);
  if (Array.isArray(content.items)) {
    parts.push(...content.items.filter((i): i is string => typeof i === "string"));
  }
  if (Array.isArray(content.headers)) {
    parts.push(...content.headers.filter((h): h is string => typeof h === "string"));
  }
  if (Array.isArray(content.rows)) {
    for (const row of content.rows) {
      if (Array.isArray(row)) {
        parts.push(...row.filter((c): c is string => typeof c === "string"));
      }
    }
  }
  
  return parts.join(" ");
}

/**
 * Detect the primary purpose of a block based on content analysis
 */
export function detectPurpose(block: Block): BlockPurpose {
  // Image blocks are always visual
  if (block.type === "image") return "visual";
  
  // Visual block types have hardcoded purpose mappings
  if (!isBasicBlockType(block.type)) {
    const visualType = block.type as VisualBlockType;
    return VISUAL_BLOCK_PURPOSE_MAP[visualType] || "insight";
  }
  
  const text = extractBlockText(block).toLowerCase();
  
  let bestMatch: BlockPurpose = "unknown";
  let highestScore = 0;
  
  for (const [purpose, patterns] of Object.entries(PURPOSE_PATTERNS)) {
    if (purpose === "unknown") continue;
    
    let score = 0;
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) score += matches.length;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = purpose as BlockPurpose;
    }
  }
  
  return bestMatch;
}

/**
 * Calculate clarity score (0-100) for a block
 */
export function calculateClarityScore(block: Block): number {
  const text = extractBlockText(block);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  // Conciseness: ideal is 20-50 words for most blocks
  let conciseness = 100;
  if (wordCount < 10) conciseness = 50;
  else if (wordCount > 100) conciseness = Math.max(30, 100 - (wordCount - 100));
  else if (wordCount >= 20 && wordCount <= 50) conciseness = 100;
  else conciseness = 80;
  
  // Actionability: has action verbs or concrete language
  const actionVerbs = /\b(implement|create|build|launch|develop|execute|deliver|achieve|improve|optimize)\b/gi;
  const actionMatches = text.match(actionVerbs) || [];
  const actionability = Math.min(100, 50 + actionMatches.length * 15);
  
  // Specificity: has numbers, percentages, or concrete terms
  const specifics = /\b(\d+%?|\$\d+|Q[1-4]|\d{4})\b/g;
  const specificMatches = text.match(specifics) || [];
  const specificity = Math.min(100, 40 + specificMatches.length * 20);
  
  // Structure: proper punctuation, capitalization
  const hasProperStructure = /^[A-Z]/.test(text) && /[.!?]$/.test(text.trim());
  const structure = hasProperStructure ? 100 : 60;
  
  return Math.round(
    conciseness * CLARITY_WEIGHTS.conciseness +
    actionability * CLARITY_WEIGHTS.actionability +
    specificity * CLARITY_WEIGHTS.specificity +
    structure * CLARITY_WEIGHTS.structure
  );
}

/**
 * Generate improvement recommendations for a block
 */
export function generateRecommendations(block: Block, metadata: Partial<BlockMetadata>): string[] {
  const recommendations: string[] = [];
  const text = extractBlockText(block);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  // Clarity recommendations
  if ((metadata.clarityScore ?? 0) < 60) {
    recommendations.push("Consider making this block more concise and specific");
  }
  
  // Length recommendations
  if (wordCount > 80) {
    recommendations.push("Split into multiple blocks for better readability");
  } else if (wordCount < 10 && block.type !== "heading") {
    recommendations.push("Add more detail to strengthen this point");
  }
  
  // Purpose-specific recommendations
  if (metadata.purpose === "unknown") {
    recommendations.push("Clarify the purpose of this block (insight, action, proof, etc.)");
  }
  
  if (metadata.purpose === "action" && !text.match(/\b(by|until|within|deadline|date)\b/i)) {
    recommendations.push("Add timeline or deadline to make action more concrete");
  }
  
  if (metadata.purpose === "proof" && !text.match(/\d/)) {
    recommendations.push("Include specific data or metrics to strengthen evidence");
  }
  
  // Executive weight recommendations
  if ((metadata.executiveWeight ?? 0) < 5) {
    recommendations.push("Consider if this block is essential for executive audience");
  }
  
  return recommendations;
}

/**
 * Calculate executive weight (0-10) - importance for exec audience
 */
export function calculateExecutiveWeight(block: Block, purpose: BlockPurpose): number {
  const purposeWeights: Record<BlockPurpose, number> = {
    summary: 10,
    action: 9,
    insight: 8,
    decision: 8,
    problem: 7,
    proof: 6,
    visual: 5,
    context: 4,
    transition: 2,
    unknown: 3,
  };
  
  let weight = purposeWeights[purpose];
  
  // Headings get a boost
  if (block.type === "heading") weight = Math.min(10, weight + 2);
  
  // Tables with data are valuable
  if (block.type === "table") weight = Math.min(10, weight + 1);
  
  return weight;
}

/**
 * Analyze a single block and generate full metadata
 */
export function analyzeBlock(block: Block, totalBlocks: number): BlockMetadata {
  const purpose = detectPurpose(block);
  const clarityScore = calculateClarityScore(block);
  const executiveWeight = calculateExecutiveWeight(block, purpose);
  const text = extractBlockText(block);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  
  const metadata: BlockMetadata = {
    purpose,
    clarityScore,
    recommendedPosition: Math.round((POSITION_WEIGHTS[purpose] / 7) * totalBlocks),
    recommendations: [],
    executiveWeight,
    wordCount,
    readTime: Math.ceil(wordCount / 150 * 60), // ~150 words per minute for presentation
  };
  
  metadata.recommendations = generateRecommendations(block, metadata);
  
  return metadata;
}

/**
 * Analyze all blocks and add intelligence metadata
 */
export function analyzeBlocks(blocks: Block[]): IntelligentBlock[] {
  return blocks.map((block) => ({
    ...block,
    metadata: analyzeBlock(block, blocks.length),
  }));
}

/**
 * Sort blocks by recommended position
 */
export function sortByRecommendedOrder(blocks: IntelligentBlock[]): IntelligentBlock[] {
  return [...blocks].sort((a, b) => a.metadata.recommendedPosition - b.metadata.recommendedPosition);
}

/**
 * Get deck-level intelligence summary
 */
export function getDeckIntelligence(blocks: IntelligentBlock[]): {
  averageClarity: number;
  totalReadTime: number;
  purposeDistribution: Record<BlockPurpose, number>;
  topRecommendations: string[];
} {
  if (blocks.length === 0) {
    return {
      averageClarity: 0,
      totalReadTime: 0,
      purposeDistribution: {} as Record<BlockPurpose, number>,
      topRecommendations: [],
    };
  }
  
  const purposeDistribution: Record<BlockPurpose, number> = {
    summary: 0, problem: 0, insight: 0, proof: 0,
    action: 0, context: 0, transition: 0, visual: 0, decision: 0, unknown: 0,
  };
  
  let totalClarity = 0;
  let totalReadTime = 0;
  const allRecommendations: string[] = [];
  
  for (const block of blocks) {
    totalClarity += block.metadata.clarityScore;
    totalReadTime += block.metadata.readTime;
    purposeDistribution[block.metadata.purpose]++;
    allRecommendations.push(...block.metadata.recommendations);
  }
  
  // Dedupe and limit recommendations
  const uniqueRecs = [...new Set(allRecommendations)];
  
  return {
    averageClarity: Math.round(totalClarity / blocks.length),
    totalReadTime,
    purposeDistribution,
    topRecommendations: uniqueRecs.slice(0, 5),
  };
}
