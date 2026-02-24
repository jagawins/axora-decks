/**
 * Tabs Block — renders 2-4 switchable content tabs inside a single slide.
 */

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { VisualBlockProps } from './types';
import type { TabsBlockPayload } from './types';

export function TabsBlock({ payload, readOnly, className = '' }: VisualBlockProps<TabsBlockPayload>) {
  const tabs = payload?.tabs ?? [];
  const defaultTab = payload?.defaultTab ?? 0;

  if (tabs.length === 0) {
    return (
      <div className={`p-space-6 text-[var(--deck-muted,hsl(var(--muted-foreground)))] ${className}`}>
        No tabs configured
      </div>
    );
  }

  const defaultValue = `tab-${Math.min(defaultTab, tabs.length - 1)}`;

  return (
    <div className={`w-full ${className}`}>
      {payload.title && (
        <h3 className="text-fluid-2xl font-semibold mb-space-4 text-[var(--deck-fg,hsl(var(--foreground)))]">
          {payload.title}
        </h3>
      )}
      <Tabs defaultValue={defaultValue} className="w-full">
        <TabsList className="w-full justify-start bg-[var(--deck-muted,hsl(var(--muted)))]/20 border border-[var(--deck-border,hsl(var(--border)))]">
          {tabs.map((tab, i) => (
            <TabsTrigger
              key={i}
              value={`tab-${i}`}
              className="data-[state=active]:bg-[var(--deck-accent,hsl(var(--primary)))] data-[state=active]:text-[var(--deck-bg,hsl(var(--primary-foreground)))] text-[var(--deck-fg,hsl(var(--foreground)))]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab, i) => (
          <TabsContent key={i} value={`tab-${i}`} className="mt-space-4">
            <div className="p-space-6 rounded-radius-lg bg-[var(--deck-muted,hsl(var(--muted)))]/10 border border-[var(--deck-border,hsl(var(--border)))]">
              <p className="text-fluid-base leading-relaxed text-[var(--deck-fg,hsl(var(--foreground)))] whitespace-pre-line">
                {tab.content}
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
