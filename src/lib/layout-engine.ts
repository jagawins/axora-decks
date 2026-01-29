/**
 * Layout Engine
 * Automatically structures content into visual blocks based on rules
 */

import type { VisualBlockType } from '@/components/blocks/types';

export interface ContentAnalysis {
  wordCount: number;
  hasNumbers: boolean;
  hasQuotes: boolean;
  isChronological: boolean;
  hasContrast: boolean;
  itemCount: number;
  hasListItems: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface LayoutDecision {
  blockType: VisualBlockType | 'text' | 'heading' | 'list' | 'callout' | 'table' | 'image';
  confidence: number;
  reason: string;
}

// Patterns for content detection
const QUOTE_PATTERNS = [
  /^["'].*["']$/m,
  /said\s+["']/i,
  /according to/i,
  /"[^"]{20,}"/,
];

const NUMBER_PATTERNS = [
  /\d+%/,
  /\$[\d,]+/,
  /\d+x/i,
  /\d+\s*(million|billion|thousand|k|m|b)/i,
  /^\s*\d+\.?\d*\s*$/m,
];

const CHRONOLOGICAL_PATTERNS = [
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  /\b(Q[1-4]|quarter|year|month|week)\b/i,
  /\b(2[0-2]\d{2}|19\d{2})\b/,
  /\b(first|second|third|then|next|finally|afterward)\b/i,
  /\b(phase|step|stage)\s+\d+/i,
];

const CONTRAST_PATTERNS = [
  /\bvs\.?\b/i,
  /\bversus\b/i,
  /\bcompared to\b/i,
  /\bbefore\s+and\s+after\b/i,
  /\bpro[s]?\s+(and|&)\s+con[s]?\b/i,
  /\badvantages?\s+(and|&)\s+disadvantages?\b/i,
];

const LIST_ITEM_PATTERNS = [
  /^[-•*]\s+/m,
  /^\d+[\.)]\s+/m,
  /^[a-z][\.)]\s+/im,
];

/**
 * Analyze raw content to determine its characteristics
 */
export function analyzeContent(content: string): ContentAnalysis {
  const words = content.split(/\s+/).filter(Boolean);
  const lines = content.split('\n').filter(Boolean);
  
  return {
    wordCount: words.length,
    hasNumbers: NUMBER_PATTERNS.some(p => p.test(content)),
    hasQuotes: QUOTE_PATTERNS.some(p => p.test(content)),
    isChronological: CHRONOLOGICAL_PATTERNS.some(p => p.test(content)),
    hasContrast: CONTRAST_PATTERNS.some(p => p.test(content)),
    itemCount: lines.length,
    hasListItems: LIST_ITEM_PATTERNS.some(p => p.test(content)),
    sentiment: detectSentiment(content),
  };
}

/**
 * Simple sentiment detection
 */
function detectSentiment(content: string): 'positive' | 'negative' | 'neutral' {
  const positive = /\b(great|excellent|amazing|success|win|growth|increase|improve|best|top)\b/gi;
  const negative = /\b(fail|loss|decrease|decline|worst|problem|issue|risk|threat)\b/gi;
  
  const positiveCount = (content.match(positive) || []).length;
  const negativeCount = (content.match(negative) || []).length;
  
  if (positiveCount > negativeCount + 2) return 'positive';
  if (negativeCount > positiveCount + 2) return 'negative';
  return 'neutral';
}

/**
 * Decide which visual block type to use based on content analysis
 */
export function decideBlockType(content: string, analysis?: ContentAnalysis): LayoutDecision {
  const a = analysis || analyzeContent(content);
  
  // Rule 1: Quotes → QuoteBlock
  if (a.hasQuotes) {
    return {
      blockType: 'quote_block',
      confidence: 0.85,
      reason: 'Content contains quoted text or testimonial patterns',
    };
  }
  
  // Rule 2: Strong number presence with multiple stats → StatBlock
  if (a.hasNumbers && a.itemCount >= 2 && a.itemCount <= 6) {
    return {
      blockType: 'stat_block',
      confidence: 0.8,
      reason: 'Content contains multiple numeric metrics',
    };
  }
  
  // Rule 3: Chronological content → TimelineBlock
  if (a.isChronological && a.itemCount >= 3) {
    return {
      blockType: 'timeline_block',
      confidence: 0.75,
      reason: 'Content follows chronological or sequential structure',
    };
  }
  
  // Rule 4: Contrasting items → ComparisonTable
  if (a.hasContrast) {
    return {
      blockType: 'comparison_table',
      confidence: 0.7,
      reason: 'Content contains comparative or contrasting elements',
    };
  }
  
  // Rule 5: 3-4 items (not list-formatted) → CardGrid
  if (a.itemCount >= 3 && a.itemCount <= 4 && !a.hasListItems) {
    return {
      blockType: 'card_grid',
      confidence: 0.7,
      reason: 'Content has 3-4 distinct items suitable for grid layout',
    };
  }
  
  // Rule 6: Long text (>200 words) → TwoColumn
  if (a.wordCount > 200) {
    return {
      blockType: 'two_col',
      confidence: 0.65,
      reason: 'Content exceeds 200 words, splitting for readability',
    };
  }
  
  // Rule 7: List items → keep as list
  if (a.hasListItems) {
    return {
      blockType: 'list',
      confidence: 0.9,
      reason: 'Content is formatted as a list',
    };
  }
  
  // Default: text block
  return {
    blockType: 'text',
    confidence: 0.5,
    reason: 'No specific visual pattern detected',
  };
}

/**
 * Extract stats from content for StatBlock
 */
export function extractStats(content: string): Array<{
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
}> {
  const stats: Array<{ value: string; label: string; trend?: 'up' | 'down' | 'neutral' }> = [];
  const lines = content.split('\n').filter(Boolean);
  
  for (const line of lines) {
    // Match patterns like "50% increase in revenue" or "$1.2M ARR"
    const numMatch = line.match(/(\$?[\d,]+\.?\d*[%kmbKMB]?)/);
    if (numMatch) {
      const value = numMatch[1];
      const label = line.replace(value, '').trim().replace(/^[-:•*]\s*/, '');
      
      // Detect trend
      let trend: 'up' | 'down' | 'neutral' | undefined;
      if (/\b(increase|up|grow|rise|gain)\b/i.test(line)) trend = 'up';
      else if (/\b(decrease|down|drop|fall|loss)\b/i.test(line)) trend = 'down';
      
      stats.push({ value, label, trend });
    }
  }
  
  return stats.slice(0, 6); // Max 6 stats
}

/**
 * Extract quote from content for QuoteBlock
 */
export function extractQuote(content: string): {
  quote: string;
  author?: string;
  role?: string;
} {
  // Try to find quoted text
  const quoteMatch = content.match(/"([^"]+)"/);
  const quote = quoteMatch ? quoteMatch[1] : content;
  
  // Try to find attribution
  const attrMatch = content.match(/[-—–]\s*(.+?)(?:,\s*(.+))?$/);
  const author = attrMatch ? attrMatch[1].trim() : undefined;
  const role = attrMatch ? attrMatch[2]?.trim() : undefined;
  
  return { quote, author, role };
}

/**
 * Extract timeline events from content
 */
export function extractTimelineEvents(content: string): Array<{
  date: string;
  title: string;
  description?: string;
  status?: 'completed' | 'current' | 'upcoming';
}> {
  const events: Array<{ date: string; title: string; description?: string; status?: 'completed' | 'current' | 'upcoming' }> = [];
  const lines = content.split('\n').filter(Boolean);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match date patterns
    const dateMatch = line.match(/^(Q[1-4]\s*'?\d{2,4}|[A-Z][a-z]+\s+\d{4}|\d{4}|Phase\s+\d+|Step\s+\d+)/i);
    if (dateMatch) {
      const date = dateMatch[1];
      const title = line.replace(dateMatch[0], '').replace(/^[-:•*]\s*/, '').trim() || `Event ${i + 1}`;
      events.push({ date, title });
    } else if (line.match(/^[-•*]\s+/)) {
      // Fallback: use line number as date
      const title = line.replace(/^[-•*]\s+/, '');
      events.push({ date: `Step ${i + 1}`, title });
    }
  }
  
  return events;
}

/**
 * Transform raw content into visual block payload
 */
export function transformToVisualBlock(
  content: string,
  targetType: LayoutDecision['blockType']
): Record<string, unknown> {
  switch (targetType) {
    case 'stat_block':
      return {
        stats: extractStats(content),
      };
    
    case 'quote_block':
      return extractQuote(content);
    
    case 'timeline_block':
      return {
        events: extractTimelineEvents(content),
      };
    
    case 'card_grid':
      const items = content.split('\n').filter(Boolean).slice(0, 4);
      return {
        cards: items.map((item, i) => ({
          title: item.replace(/^[-•*]\s+/, '').slice(0, 50),
          description: item.length > 50 ? item.slice(50) : undefined,
        })),
        columns: items.length <= 2 ? 2 : items.length === 4 ? 4 : 3,
      };
    
    case 'two_col':
      const midpoint = Math.floor(content.length / 2);
      const splitAt = content.indexOf('\n', midpoint) || midpoint;
      return {
        left: { content: content.slice(0, splitAt), type: 'text' },
        right: { content: content.slice(splitAt), type: 'text' },
        ratio: '50-50',
      };
    
    default:
      return { text: content };
  }
}

/**
 * Full layout engine pipeline
 */
export function runLayoutEngine(content: string): {
  decision: LayoutDecision;
  payload: Record<string, unknown>;
} {
  const analysis = analyzeContent(content);
  const decision = decideBlockType(content, analysis);
  const payload = transformToVisualBlock(content, decision.blockType);
  
  return { decision, payload };
}
