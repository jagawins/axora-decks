/**
 * Visual Block Types and Shared Interfaces
 * These types power the Axora visual template system
 */

import type { LucideIcon } from 'lucide-react';

// Base block payload that all visual blocks extend
export interface BaseBlockPayload {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: {
    src?: string;
    prompt?: string;
    alt?: string;
  };
  icon?: string;
  themeColor?: 'accent' | 'success' | 'warning' | 'muted' | 'primary';
}

// Stat Block
export interface StatBlockPayload extends BaseBlockPayload {
  stats: Array<{
    value: string;
    label: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  layout?: 'row' | 'grid';
}

// Quote Block
export interface QuoteBlockPayload extends BaseBlockPayload {
  quote: string;
  author?: string;
  role?: string;
  company?: string;
}

// Timeline Block
export interface TimelineBlockPayload extends BaseBlockPayload {
  events: Array<{
    date: string;
    title: string;
    description?: string;
    status?: 'completed' | 'current' | 'upcoming';
  }>;
}

// Comparison Table Block
export interface ComparisonTablePayload extends BaseBlockPayload {
  headers: string[];
  rows: Array<{
    label: string;
    values: Array<string | boolean>;
  }>;
  highlightColumn?: number;
}

// Card Grid Block
export interface CardGridPayload extends BaseBlockPayload {
  cards: Array<{
    title: string;
    description?: string;
    icon?: string;
    image?: {
      src?: string;
      prompt?: string;
      alt?: string;
    };
    link?: string;
  }>;
  columns?: 2 | 3 | 4;
}

// Hero Header Block
export interface HeroHeaderPayload extends BaseBlockPayload {
  heading: string;
  subheading?: string;
  cta?: {
    text: string;
    href?: string;
  };
  backgroundStyle?: 'gradient' | 'image' | 'solid';
}

// Exec Summary Block
export interface ExecSummaryPayload extends BaseBlockPayload {
  summary: string;
  keyPoints: string[];
  bottomLine?: string;
}

// CTA Section Block
export interface CTASectionPayload extends BaseBlockPayload {
  heading: string;
  subheading?: string;
  primaryCta?: {
    text: string;
    href?: string;
  };
  secondaryCta?: {
    text: string;
    href?: string;
  };
}

// Section Divider Block
export interface SectionDividerPayload extends BaseBlockPayload {
  style?: 'line' | 'gradient' | 'dots' | 'space';
  label?: string;
}

// Icon Text Block
export interface IconTextBlockPayload extends BaseBlockPayload {
  items: Array<{
    icon: string;
    title: string;
    description?: string;
  }>;
  layout?: 'vertical' | 'horizontal';
}

// Framed Insight Block
export interface FramedInsightPayload extends BaseBlockPayload {
  insight: string;
  context?: string;
  source?: string;
  type?: 'tip' | 'warning' | 'insight' | 'note';
}

// Two Column Block (upgraded)
export interface TwoColumnPayload extends BaseBlockPayload {
  left: {
    content: string;
    type?: 'text' | 'list' | 'image';
  };
  right: {
    content: string;
    type?: 'text' | 'list' | 'image';
  };
  ratio?: '50-50' | '60-40' | '40-60' | '70-30' | '30-70';
}

// Union type for all visual block payloads
export type VisualBlockPayload =
  | StatBlockPayload
  | QuoteBlockPayload
  | TimelineBlockPayload
  | ComparisonTablePayload
  | CardGridPayload
  | HeroHeaderPayload
  | ExecSummaryPayload
  | CTASectionPayload
  | SectionDividerPayload
  | IconTextBlockPayload
  | FramedInsightPayload
  | TwoColumnPayload;

// Visual block type names
export type VisualBlockType =
  | 'stat_block'
  | 'quote_block'
  | 'timeline_block'
  | 'comparison_table'
  | 'card_grid'
  | 'hero_header'
  | 'exec_summary'
  | 'cta_section'
  | 'section_divider'
  | 'icon_text_block'
  | 'framed_insight'
  | 'two_col';

// Props for visual block components
export interface VisualBlockProps<T extends BaseBlockPayload = BaseBlockPayload> {
  payload: T;
  readOnly?: boolean;
  className?: string;
}
