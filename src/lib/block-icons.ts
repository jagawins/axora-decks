/**
 * Shared block icon mappings for the presentation editor.
 */

import {
  FileText,
  Heading,
  List,
  AlertCircle,
  Columns,
  Table,
  Image,
  BarChart3,
  Quote,
  Clock,
  GitCompare,
  LayoutGrid,
  Sparkles,
  FileCheck,
  MousePointerClick,
  Minus,
  icons,
  Lightbulb,
  LucideIcon,
  HelpCircle,
  MapPin,
  Layers,
  CheckSquare,
  Target,
  Grid3X3,
  ListChecks,
} from "lucide-react";
import { BlockType } from "./blocks";

/**
 * Icon mappings for all block types
 */
export const BLOCK_ICONS: Record<BlockType, LucideIcon> = {
  // Basic blocks
  text: FileText,
  heading: Heading,
  list: List,
  callout: AlertCircle,
  two_col: Columns,
  table: Table,
  image: Image,
  // Visual blocks
  stat_block: BarChart3,
  quote_block: Quote,
  timeline_block: Clock,
  comparison_table: GitCompare,
  card_grid: LayoutGrid,
  hero_header: Sparkles,
  exec_summary: FileCheck,
  cta_section: MousePointerClick,
  section_divider: Minus,
  icon_text_block: icons.Star as LucideIcon,
  framed_insight: Lightbulb,
  three_pillars: Target,
  two_by_two_matrix: Grid3X3,
  decision_next_steps: ListChecks,
  // Decision blocks
  decision_summary: HelpCircle,
  evidence_map: MapPin,
  scenario_set: Layers,
  recommendation_panel: CheckSquare,
};

/**
 * Get icon for a block type with fallback
 */
export function getBlockIcon(type: BlockType): LucideIcon {
  return BLOCK_ICONS[type] || FileText;
}
