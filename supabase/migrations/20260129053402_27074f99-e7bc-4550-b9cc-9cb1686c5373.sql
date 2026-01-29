-- Add new visual block types to the block_type enum
-- These represent the 12 new visual block components

ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'stat_block';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'quote_block';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'timeline_block';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'comparison_table';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'card_grid';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'hero_header';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'exec_summary';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'cta_section';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'section_divider';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'icon_text_block';
ALTER TYPE block_type ADD VALUE IF NOT EXISTS 'framed_insight';