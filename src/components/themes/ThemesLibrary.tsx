import { useState, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Search, Plus, Download, MoreHorizontal, Palette, Scissors, Archive,
  Check, Upload, FileJson,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

/* ── Extended theme definitions with full visual data ────────── */

export interface ThemeDefinition {
  id: string;
  label: string;
  category: 'standard' | 'custom' | 'archived';
  bg: string;        // background color
  fg: string;        // text color
  accent: string;    // accent/link color
  surface: string;   // card/surface color
  muted: string;     // muted text
  gradient: string;  // top decorative strip gradient
  headingFont: string;
  bodyFont: string;
}

const THEME_LIBRARY: ThemeDefinition[] = [
  {
    id: 'pearl',
    label: 'Pearl',
    category: 'standard',
    bg: '#FAFAFA',
    fg: '#1A1A1A',
    accent: '#3B82F6',
    surface: '#FFFFFF',
    muted: '#6B7280',
    gradient: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  {
    id: 'vortex',
    label: 'Vortex',
    category: 'standard',
    bg: '#0A0A0A',
    fg: '#FAFAFA',
    accent: '#38BDF8',
    surface: '#1A1A1A',
    muted: '#9CA3AF',
    gradient: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
  },
  {
    id: 'clementa',
    label: 'Clementa',
    category: 'standard',
    bg: '#F5F0E8',
    fg: '#2D2418',
    accent: '#C2410C',
    surface: '#FEFCF6',
    muted: '#8B7355',
    gradient: 'linear-gradient(135deg, #f5f0e8, #e8dcc8)',
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
  },
  {
    id: 'stratos',
    label: 'Stratos',
    category: 'standard',
    bg: '#0F172A',
    fg: '#F1F5F9',
    accent: '#A78BFA',
    surface: '#1E293B',
    muted: '#94A3B8',
    gradient: 'linear-gradient(135deg, #0f172a, #312e81)',
    headingFont: 'Sora',
    bodyFont: 'Inter',
  },
  {
    id: 'nova',
    label: 'Nova',
    category: 'standard',
    bg: '#FFFBF5',
    fg: '#1C1917',
    accent: '#F97316',
    surface: '#FFFFFF',
    muted: '#78716C',
    gradient: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
    headingFont: 'Outfit',
    bodyFont: 'Nunito Sans',
  },
  {
    id: 'twilight',
    label: 'Twilight',
    category: 'standard',
    bg: '#0C0A1D',
    fg: '#E2E8F0',
    accent: '#EC4899',
    surface: '#1A1530',
    muted: '#94A3B8',
    gradient: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
    headingFont: 'DM Sans',
    bodyFont: 'DM Sans',
  },
  {
    id: 'coral-glow',
    label: 'Coral Glow',
    category: 'standard',
    bg: '#FFF5F5',
    fg: '#1A1A2E',
    accent: '#F43F5E',
    surface: '#FFFFFF',
    muted: '#9CA3AF',
    gradient: 'linear-gradient(135deg, #ffe4e6, #fecdd3)',
    headingFont: 'Cabinet Grotesk',
    bodyFont: 'Inter',
  },
  {
    id: 'mercury',
    label: 'Mercury',
    category: 'standard',
    bg: '#F8FAFC',
    fg: '#0F172A',
    accent: '#6366F1',
    surface: '#FFFFFF',
    muted: '#64748B',
    gradient: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    headingFont: 'Inter',
    bodyFont: 'IBM Plex Sans',
  },
  {
    id: 'forest',
    label: 'Forest',
    category: 'standard',
    bg: '#0A1A0F',
    fg: '#E2F0E8',
    accent: '#34D399',
    surface: '#132A1A',
    muted: '#6EE7A8',
    gradient: 'linear-gradient(135deg, #064e3b, #065f46)',
    headingFont: 'Space Grotesk',
    bodyFont: 'Inter',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    category: 'standard',
    bg: '#0B1628',
    fg: '#E0F2FE',
    accent: '#38BDF8',
    surface: '#122A52',
    muted: '#7DD3FC',
    gradient: 'linear-gradient(135deg, #0c4a6e, #164e63)',
    headingFont: 'Outfit',
    bodyFont: 'Inter',
  },
  {
    id: 'executive',
    label: 'Executive',
    category: 'standard',
    bg: '#1A1A2E',
    fg: '#FAFAFA',
    accent: '#A78BFA',
    surface: '#252540',
    muted: '#A1A1AA',
    gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    headingFont: 'Playfair Display',
    bodyFont: 'Source Sans Pro',
  },
  {
    id: 'sand',
    label: 'Sand',
    category: 'standard',
    bg: '#FAF7F2',
    fg: '#292524',
    accent: '#D97706',
    surface: '#FEFDFB',
    muted: '#A8A29E',
    gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)',
    headingFont: 'DM Sans',
    bodyFont: 'Nunito Sans',
  },
];

/* ── Theme preview card (Gamma-style) ───────────────────────── */

function ThemePreviewCard({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeDefinition;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        'group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200',
        isActive
          ? 'border-accent ring-2 ring-accent/20'
          : 'border-border/50 hover:border-border hover:shadow-md'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      {/* Preview area — mimics a slide */}
      <div
        className="relative w-full aspect-[4/3] overflow-hidden"
        style={{ background: theme.bg }}
      >
        {/* Decorative top strip */}
        <div
          className="absolute top-0 left-0 right-0 h-12"
          style={{ background: theme.gradient }}
        />

        {/* Content preview */}
        <div className="relative z-10 p-5 pt-16 h-full flex flex-col">
          {/* Title */}
          <div
            className="text-base font-bold leading-tight mb-1"
            style={{
              color: theme.fg,
              fontFamily: `'${theme.headingFont}', sans-serif`,
            }}
          >
            Title
          </div>

          {/* Body & link */}
          <div className="flex items-center gap-1">
            <span
              className="text-xs"
              style={{
                color: theme.muted,
                fontFamily: `'${theme.bodyFont}', sans-serif`,
              }}
            >
              Body &{' '}
            </span>
            <span
              className="text-xs underline"
              style={{
                color: theme.accent,
                fontFamily: `'${theme.bodyFont}', sans-serif`,
              }}
            >
              link
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Color swatches row */}
          <div className="flex items-center gap-1.5 mt-3">
            <div className="w-4 h-4 rounded-full border border-border/60" style={{ background: theme.accent }} />
            <div className="w-4 h-4 rounded-full border border-border/60" style={{ background: theme.fg }} />
            <div className="w-4 h-4 rounded-full border border-border/60 opacity-50" style={{ background: theme.muted }} />
          </div>
        </div>

        {/* Active checkmark */}
        {isActive && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent flex items-center justify-center z-20">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-200"
          style={{
            opacity: hovered && !isActive ? 1 : 0,
            background: 'rgba(0,0,0,0.25)',
          }}
        >
          <Button
            size="sm"
            className="rounded-full px-4 text-xs shadow-xl bg-white hover:bg-white text-gray-900 font-medium"
          >
            Apply Theme
          </Button>
        </div>
      </div>

      {/* Bottom label + menu */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-card border-t border-border/30">
        <span className="text-sm font-medium text-foreground">{theme.label}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 rounded hover:bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="gap-2 text-xs">
              <Palette className="h-3.5 w-3.5" />
              Customize
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-xs">
              <Archive className="h-3.5 w-3.5" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/* ── Main ThemesLibrary component ───────────────────────────── */

type ThemeFilter = 'custom' | 'standard' | 'archived';

export default function ThemesLibrary() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<ThemeFilter>('standard');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeThemeId, setActiveThemeId] = useState<string>('pearl');

  const filteredThemes = useMemo(() => {
    let themes = THEME_LIBRARY.filter((t) => t.category === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      themes = themes.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.headingFont.toLowerCase().includes(q) ||
          t.bodyFont.toLowerCase().includes(q)
      );
    }
    return themes;
  }, [filter, searchQuery]);

  const FILTERS: { id: ThemeFilter; label: string; icon: React.ReactNode }[] = [
    { id: 'custom', label: 'Custom', icon: <Scissors className="h-4 w-4" /> },
    { id: 'standard', label: 'Standard', icon: <Palette className="h-4 w-4" /> },
    { id: 'archived', label: 'Archived', icon: <Archive className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-accent" />
          Themes
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Themes control the colors, fonts, and design of your decks. Browse standard themes or create your own.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button className="gap-2 rounded-lg">
          <Plus className="h-4 w-4" />
          New theme
        </Button>
        <Button variant="outline" className="gap-2 rounded-lg">
          <Download className="h-4 w-4" />
          Import theme
        </Button>
      </div>

      {/* Filter tabs + Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                filter === f.id
                  ? 'bg-background shadow-sm text-foreground border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, keyword, author name, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
      </div>

      {/* Theme grid */}
      {filteredThemes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredThemes.map((theme) => (
            <ThemePreviewCard
              key={theme.id}
              theme={theme}
              isActive={activeThemeId === theme.id}
              onSelect={() => {
                setActiveThemeId(theme.id);
                toast({
                  title: `${theme.label} theme selected`,
                  description: 'This theme will be applied to new decks.',
                });
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Palette className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {filter === 'custom'
              ? 'No custom themes yet. Create one to get started.'
              : filter === 'archived'
              ? 'No archived themes.'
              : 'No themes match your search.'}
          </p>
          {filter === 'custom' && (
            <Button size="sm" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create your first theme
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
