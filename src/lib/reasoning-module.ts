/**
 * Reasoning Module
 * Structures raw text into executive blocks: summary, problem, insight, proof, action
 */

import { BlockType, AIBlock, normalizeBlockContent, sanitizeContent } from "./blocks";
import { BlockPurpose, detectPurpose, analyzeBlock } from "./block-intelligence";

export interface ExecutiveSection {
  purpose: BlockPurpose;
  content: string;
  confidence: number; // 0-1, how confident we are in this classification
}

export interface StructuredDeck {
  title: string;
  sections: ExecutiveSection[];
  suggestedBlocks: AIBlock[];
}

// Sentence-level patterns for segmentation
const SECTION_MARKERS: Record<BlockPurpose, RegExp[]> = {
  summary: [
    /^(in summary|to summarize|the key takeaway|bottom line|in short)/i,
    /^(overall|ultimately|in conclusion)/i,
  ],
  problem: [
    /^(the (main )?problem|the challenge|we face|the issue|currently)/i,
    /^(however|but|unfortunately|the difficulty)/i,
  ],
  insight: [
    /^(we (found|discovered)|our (analysis|research)|data shows|interestingly)/i,
    /^(notably|significantly|the data (reveals|indicates))/i,
  ],
  proof: [
    /^(\d+%|\$\d|according to|research (shows|indicates)|studies (show|suggest))/i,
    /^(for example|for instance|case in point|evidence suggests)/i,
  ],
  action: [
    /^(we (recommend|propose|suggest)|next steps|action items|moving forward)/i,
    /^(to (address|solve|improve)|the plan|our recommendation)/i,
  ],
  context: [
    /^(background|historically|traditionally|to understand|context)/i,
    /^(first|before we|let me explain|the situation)/i,
  ],
  transition: [
    /^(now|next|moving on|let's|turning to|speaking of)/i,
  ],
  decision: [
    /^(the decision|we decided|choosing|compare|versus)/i,
    /^(option|alternative|which is better|pros and cons)/i,
  ],
  visual: [],
  unknown: [],
};

/**
 * Split raw text into sentences
 */
function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Split raw text into paragraphs
 */
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/**
 * Classify a sentence or paragraph by executive purpose
 */
function classifyText(text: string): { purpose: BlockPurpose; confidence: number } {
  const lower = text.toLowerCase();
  
  for (const [purpose, patterns] of Object.entries(SECTION_MARKERS)) {
    if (purpose === "unknown" || purpose === "visual") continue;
    
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        return { purpose: purpose as BlockPurpose, confidence: 0.8 };
      }
    }
  }
  
  // Fallback heuristics
  if (/\d+%|\$\d+|\d+x/i.test(text)) {
    return { purpose: "proof", confidence: 0.6 };
  }
  
  if (/should|must|need to|recommend/i.test(text)) {
    return { purpose: "action", confidence: 0.5 };
  }
  
  if (/problem|challenge|issue|obstacle/i.test(text)) {
    return { purpose: "problem", confidence: 0.5 };
  }
  
  return { purpose: "unknown", confidence: 0.2 };
}

/**
 * Merge consecutive sections with same purpose
 */
function mergeSections(sections: ExecutiveSection[]): ExecutiveSection[] {
  if (sections.length === 0) return [];
  
  const merged: ExecutiveSection[] = [];
  let current = { ...sections[0] };
  
  for (let i = 1; i < sections.length; i++) {
    const next = sections[i];
    
    if (next.purpose === current.purpose) {
      current.content += " " + next.content;
      current.confidence = (current.confidence + next.confidence) / 2;
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  
  merged.push(current);
  return merged;
}

/**
 * Determine optimal block type for a section
 */
function getBlockTypeForSection(section: ExecutiveSection): BlockType {
  const text = section.content;
  
  // Check for list patterns
  const listPatterns = /(?:^|\n)\s*[-•◦▪▸►\d.]+\s+/;
  if (listPatterns.test(text) || (text.match(/\n/g)?.length ?? 0) >= 2) {
    return "list";
  }
  
  // Short, impactful text = callout
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 25 && (section.purpose === "summary" || section.purpose === "action")) {
    return "callout";
  }
  
  // Title-like content = heading
  if (wordCount < 10 && !text.includes(".")) {
    return "heading";
  }
  
  return "text";
}

/**
 * Convert section to AIBlock
 */
function sectionToBlock(section: ExecutiveSection, index: number): AIBlock {
  const blockType = getBlockTypeForSection(section);
  const text = section.content.trim();
  
  let content: Record<string, unknown>;
  
  switch (blockType) {
    case "heading":
      content = { level: 2, text };
      break;
    case "list":
      const items = text
        .split(/\n/)
        .map((line) => line.replace(/^[-•◦▪▸►\d.]+\s*/, "").trim())
        .filter(Boolean);
      content = { items, ordered: false };
      break;
    case "callout":
      const icon = section.purpose === "action" ? "warning" : "info";
      content = { text, icon };
      break;
    default:
      content = { text };
  }
  
  return {
    type: blockType,
    content: normalizeBlockContent(blockType, sanitizeContent(content)),
    order_index: index,
  };
}

/**
 * Extract a title from the first section if possible
 */
function extractTitle(sections: ExecutiveSection[]): string {
  if (sections.length === 0) return "Untitled Deck";
  
  const first = sections[0].content;
  const firstLine = first.split(/[.\n]/)[0].trim();
  
  if (firstLine.length <= 60 && firstLine.length >= 3) {
    return firstLine;
  }
  
  // Try to extract from summary purpose
  const summary = sections.find((s) => s.purpose === "summary");
  if (summary) {
    const summaryLine = summary.content.split(/[.\n]/)[0].trim();
    if (summaryLine.length <= 60) return summaryLine;
  }
  
  return "Executive Presentation";
}

/**
 * Main function: Structure raw text into executive blocks
 */
export function structureRawText(rawText: string): StructuredDeck {
  // Split into paragraphs first, then sentences within
  const paragraphs = splitIntoParagraphs(rawText);
  
  const sections: ExecutiveSection[] = [];
  
  for (const paragraph of paragraphs) {
    const classification = classifyText(paragraph);
    sections.push({
      purpose: classification.purpose,
      content: paragraph,
      confidence: classification.confidence,
    });
  }
  
  // Merge consecutive same-purpose sections
  const mergedSections = mergeSections(sections);
  
  // Sort by executive presentation order
  const purposeOrder: BlockPurpose[] = [
    "summary", "problem", "context", "insight", "proof", "action"
  ];
  
  const sortedSections = [...mergedSections].sort((a, b) => {
    const aIndex = purposeOrder.indexOf(a.purpose);
    const bIndex = purposeOrder.indexOf(b.purpose);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
  
  // Convert to blocks
  const suggestedBlocks = sortedSections.map((section, i) => sectionToBlock(section, i));
  
  return {
    title: extractTitle(sections),
    sections: sortedSections,
    suggestedBlocks,
  };
}

/**
 * Quick analysis: get purpose distribution without full block conversion
 */
export function analyzeTextStructure(rawText: string): {
  hasSummary: boolean;
  hasProblem: boolean;
  hasInsight: boolean;
  hasProof: boolean;
  hasAction: boolean;
  missingPurposes: BlockPurpose[];
  recommendations: string[];
} {
  const { sections } = structureRawText(rawText);
  const purposes = new Set(sections.map((s) => s.purpose));
  
  const essentialPurposes: BlockPurpose[] = ["summary", "problem", "insight", "proof", "action"];
  const missing = essentialPurposes.filter((p) => !purposes.has(p));
  
  const recommendations: string[] = [];
  
  if (!purposes.has("summary")) {
    recommendations.push("Add an executive summary at the start");
  }
  if (!purposes.has("action")) {
    recommendations.push("Include clear next steps or call to action");
  }
  if (!purposes.has("proof") && !purposes.has("insight")) {
    recommendations.push("Support claims with data or insights");
  }
  
  return {
    hasSummary: purposes.has("summary"),
    hasProblem: purposes.has("problem"),
    hasInsight: purposes.has("insight"),
    hasProof: purposes.has("proof"),
    hasAction: purposes.has("action"),
    missingPurposes: missing,
    recommendations,
  };
}

/**
 * Enhance existing blocks with reasoning analysis
 */
export function enhanceBlocksWithReasoning(blocks: AIBlock[]): {
  blocks: AIBlock[];
  deckBalance: {
    purposeCounts: Record<string, number>;
    isBalanced: boolean;
    suggestions: string[];
  };
} {
  const purposeCounts: Record<string, number> = {};
  
  for (const block of blocks) {
    const tempBlock = {
      id: "temp",
      type: block.type,
      content: block.content,
      order_index: block.order_index ?? 0,
    };
    const metadata = analyzeBlock(tempBlock, blocks.length);
    purposeCounts[metadata.purpose] = (purposeCounts[metadata.purpose] || 0) + 1;
  }
  
  const suggestions: string[] = [];
  const hasSummary = (purposeCounts.summary || 0) > 0;
  const hasAction = (purposeCounts.action || 0) > 0;
  const hasProof = (purposeCounts.proof || 0) > 0;
  
  if (!hasSummary) suggestions.push("Consider adding an executive summary block");
  if (!hasAction) suggestions.push("Add a clear call to action");
  if (!hasProof && blocks.length > 3) suggestions.push("Include supporting data or evidence");
  
  const isBalanced = hasSummary && hasAction && (blocks.length <= 3 || hasProof);
  
  return {
    blocks,
    deckBalance: {
      purposeCounts,
      isBalanced,
      suggestions,
    },
  };
}
