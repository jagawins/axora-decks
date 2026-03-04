import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, Loader2, Download, RefreshCw, Share2,
  BarChart3, PieChart, TrendingUp, GitBranch, Layers,
  LayoutGrid, LayoutList, Columns, Square,
  ChevronLeft, ChevronRight, Wand2, Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { invokeFunction } from '@/lib/supabase-function-client';

/* ── Styles ─────────────────────────────────────────────────────── */

interface InfographicStyle {
  id: string;
  label: string;
  description: string;
  preview: string; // emoji/icon placeholder
  colors: string[];
}

const STYLES: InfographicStyle[] = [
  {
    id: 'polished-flat',
    label: 'Polished Flat',
    description: 'Clean vector style with bold colors',
    preview: '📊',
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  },
  {
    id: 'technical',
    label: 'Technical',
    description: 'Blueprint-style with grid lines',
    preview: '⚙️',
    colors: ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD'],
  },
  {
    id: 'magazine',
    label: 'Magazine Editorial',
    description: 'Bold typography, editorial layout',
    preview: '📰',
    colors: ['#0F172A', '#1E293B', '#F97316', '#FBBF24'],
  },
  {
    id: 'digital-collage',
    label: 'Digital Collage',
    description: 'Modern mixed-media aesthetic',
    preview: '🎨',
    colors: ['#EC4899', '#8B5CF6', '#06B6D4', '#14B8A6'],
  },
  {
    id: 'isometric',
    label: 'Isometric 3D',
    description: '3D isometric illustrations',
    preview: '🧊',
    colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  },
  {
    id: 'minimal',
    label: 'Minimal Clean',
    description: 'White space, simple shapes',
    preview: '◻️',
    colors: ['#111827', '#374151', '#6B7280', '#D1D5DB'],
  },
];

/* ── Layouts ────────────────────────────────────────────────────── */

interface InfographicLayout {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const LAYOUTS: InfographicLayout[] = [
  { id: 'flow', label: 'Process Flow', icon: <GitBranch className="h-5 w-5" />, description: 'Step-by-step process' },
  { id: 'comparison', label: 'Comparison', icon: <Columns className="h-5 w-5" />, description: 'Side-by-side compare' },
  { id: 'stats', label: 'Stats & Data', icon: <BarChart3 className="h-5 w-5" />, description: 'Numbers & charts' },
  { id: 'timeline', label: 'Timeline', icon: <TrendingUp className="h-5 w-5" />, description: 'Chronological events' },
  { id: 'hierarchy', label: 'Hierarchy', icon: <Layers className="h-5 w-5" />, description: 'Org chart / tree' },
  { id: 'grid', label: 'Grid Layout', icon: <LayoutGrid className="h-5 w-5" />, description: 'Multi-panel grid' },
  { id: 'list', label: 'Numbered List', icon: <LayoutList className="h-5 w-5" />, description: 'Top N / ranked items' },
  { id: 'single', label: 'Single Visual', icon: <PieChart className="h-5 w-5" />, description: 'One chart or diagram' },
];

/* ── Size presets ───────────────────────────────────────────────── */

interface SizePreset {
  id: string;
  label: string;
  ratio: string;
  width: number;
  height: number;
}

const SIZES: SizePreset[] = [
  { id: 'slide', label: 'Slide (16:9)', ratio: '16:9', width: 1920, height: 1080 },
  { id: 'square', label: 'Social (1:1)', ratio: '1:1', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait (9:16)', ratio: '9:16', width: 1080, height: 1920 },
  { id: 'a4', label: 'A4 Document', ratio: '210:297', width: 1240, height: 1754 },
];

/* ── Quick prompt suggestions ──────────────────────────────────── */

const PROMPT_SUGGESTIONS = [
  'Company growth metrics for Q4 2024',
  '5-step product development process',
  'Market size comparison: SaaS vs On-prem',
  'Customer journey from awareness to advocacy',
  'Team structure for a 50-person startup',
  'AI adoption trends 2020-2025',
  'Revenue breakdown by region and product',
  'Project timeline for app launch',
];

/* ── Main Component ─────────────────────────────────────────────── */

export default function InfographicGenerator() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState<'compose' | 'generating' | 'result'>('compose');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0].id);
  const [selectedLayout, setSelectedLayout] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState(SIZES[0].id);
  const [stylePageIndex, setStylePageIndex] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stylesPerPage = 6;
  const totalStylePages = Math.ceil(STYLES.length / stylesPerPage);
  const visibleStyles = STYLES.slice(
    stylePageIndex * stylesPerPage,
    (stylePageIndex + 1) * stylesPerPage
  );

  const currentSize = SIZES.find((s) => s.id === selectedSize) || SIZES[0];

  const handleGenerate = useCallback(async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!prompt.trim()) return;

    setStep('generating');
    setError(null);
    setGeneratedImage(null);

    const styleDef = STYLES.find((s) => s.id === selectedStyle);
    const layoutDef = LAYOUTS.find((l) => l.id === selectedLayout);

    // Build a rich prompt for the infographic
    const infographicPrompt = [
      `Create a professional infographic about: ${prompt.trim()}.`,
      `Style: ${styleDef?.label || 'Polished Flat'} — ${styleDef?.description || 'clean vector style'}.`,
      layoutDef ? `Layout: ${layoutDef.label} — ${layoutDef.description}.` : '',
      `Dimensions: ${currentSize.width}x${currentSize.height} (${currentSize.ratio}).`,
      `Color palette: ${styleDef?.colors.join(', ')}.`,
      'The infographic should be visually rich with icons, labels, data points, and clear hierarchy.',
      'Use bold headings, clean typography, and structured sections.',
      'Make it look like a professionally designed infographic, not a photo.',
      'Include relevant numbers, statistics, and visual elements.',
    ].filter(Boolean).join(' ');

    try {
      const { data, error: fnError } = await invokeFunction<{ url: string }>('image-generate', {
        prompt: infographicPrompt,
        style: 'infographic',
        quality: 'pro',
      });

      if (fnError || !data?.url) {
        setError(fnError || 'Failed to generate infographic. Please try again.');
        setStep('compose');
        return;
      }

      setGeneratedImage(data.url);
      setStep('result');
    } catch (err) {
      console.error('Infographic generation error:', err);
      setError('Something went wrong. Please try again.');
      setStep('compose');
    }
  }, [user, navigate, prompt, selectedStyle, selectedLayout, selectedSize, currentSize]);

  const handleDownload = useCallback(async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `axora-infographic-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(generatedImage, '_blank');
    }
  }, [generatedImage]);

  const handleReset = useCallback(() => {
    setStep('compose');
    setGeneratedImage(null);
    setError(null);
  }, []);

  /* ── Compose Step ──────────────────────────────────────────────── */
  if (step === 'compose') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI Infographics
            <Badge variant="outline" className="text-[10px] ml-1">BETA</Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Create an infographic
          </h2>
          <p className="text-muted-foreground">
            Describe what you want to see by selecting a style and prompt
          </p>
        </div>

        {/* Style Picker */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Infographic style</h3>
            {totalStylePages > 1 && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <span>
                  {stylePageIndex + 1} / {totalStylePages}
                </span>
                <button
                  onClick={() => setStylePageIndex(Math.max(0, stylePageIndex - 1))}
                  disabled={stylePageIndex === 0}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setStylePageIndex(Math.min(totalStylePages - 1, stylePageIndex + 1))}
                  disabled={stylePageIndex >= totalStylePages - 1}
                  className="p-1 rounded hover:bg-muted disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {visibleStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={cn(
                  'relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200',
                  selectedStyle === style.id
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                    : 'border-border/50 hover:border-border hover:bg-muted/30'
                )}
              >
                {/* Color preview dots */}
                <div className="w-full h-12 rounded-lg overflow-hidden flex items-center justify-center bg-muted/50">
                  <div className="flex gap-1">
                    {style.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-[11px] font-medium text-foreground text-center leading-tight">
                  {style.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Layout Picker (optional) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Layout <span className="text-muted-foreground font-normal">(optional)</span></h3>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSelectedLayout(selectedLayout === layout.id ? null : layout.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200',
                  selectedLayout === layout.id
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/20'
                    : 'border-border/50 hover:border-border hover:bg-muted/30'
                )}
              >
                <div className="text-muted-foreground">{layout.icon}</div>
                <span className="text-[10px] font-medium text-foreground text-center leading-tight">
                  {layout.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Size Picker */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all',
                  selectedSize === size.id
                    ? 'border-accent bg-accent/5 text-foreground font-medium'
                    : 'border-border/50 text-muted-foreground hover:border-border'
                )}
              >
                <Square className="h-3.5 w-3.5" />
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Describe your infographic</h3>
          <Textarea
            placeholder="e.g. Company growth metrics for Q4 2024 showing revenue, users, and market share..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none text-sm"
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{prompt.length}/500</span>
          </div>
        </div>

        {/* Quick prompts */}
        <div className="mb-8">
          <p className="text-xs text-muted-foreground mb-2">Try a suggestion:</p>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <Button
          size="lg"
          className="w-full gap-2 rounded-xl text-base"
          disabled={!prompt.trim()}
          onClick={handleGenerate}
        >
          <Wand2 className="h-5 w-5" />
          Generate Infographic
        </Button>
      </div>
    );
  }

  /* ── Generating Step ───────────────────────────────────────────── */
  if (step === 'generating') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-accent animate-spin" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-accent-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">Generating your infographic...</h3>
        <p className="text-muted-foreground text-sm text-center max-w-md">
          Our AI is creating a custom infographic based on your description. This usually takes 10–30 seconds.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    );
  }

  /* ── Result Step ───────────────────────────────────────────────── */
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Your Infographic</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{prompt}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleReset}>
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
          <Button size="sm" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Use in Deck
          </Button>
        </div>
      </div>

      {/* Image preview */}
      <div className="rounded-2xl border border-border bg-muted/20 overflow-hidden">
        {generatedImage ? (
          <img
            src={generatedImage}
            alt="Generated infographic"
            className="w-full h-auto"
            style={{
              maxHeight: '80vh',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div className="aspect-video flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Actions below */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={handleReset}>
          ← Back to generator
        </Button>
      </div>
    </div>
  );
}
