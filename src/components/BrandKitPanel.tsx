/**
 * Brand Kit Settings Panel for the Editor
 */

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BrandKit,
  HEADING_FONTS,
  BODY_FONTS,
  TYPOGRAPHY_SCALES,
  HeadingFont,
  BodyFont,
  TypographyScale,
  LogoPlacement,
} from "@/lib/brand";

interface BrandKitPanelProps {
  brandKit: BrandKit;
  onChange: (kit: BrandKit) => void;
}

export function BrandKitPanel({ brandKit, onChange }: BrandKitPanelProps) {
  const colors = brandKit.colors || {};
  const typography = brandKit.typography || {};
  const logo = brandKit.logo || {};

  const updateColor = (key: string, value: string) => {
    onChange({
      ...brandKit,
      colors: { ...colors, [key]: value },
    });
  };

  const updateTypography = (key: string, value: string) => {
    onChange({
      ...brandKit,
      typography: { ...typography, [key]: value },
    });
  };

  const updateLogo = (key: string, value: string) => {
    onChange({
      ...brandKit,
      logo: { ...logo, [key]: value },
    });
  };

  return (
    <div className="space-y-5 p-1">
      {/* Colors */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Brand Colors
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: "primary", label: "Primary" },
            { key: "accent", label: "Accent" },
            { key: "background", label: "Background" },
            { key: "foreground", label: "Text" },
            { key: "muted", label: "Muted" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={(colors as any)[key] || "#3b82f6"}
                onChange={(e) => updateColor(key, e.target.value)}
                className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Typography
        </h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Heading Font</Label>
            <Select
              value={typography.headingFont || "Inter"}
              onValueChange={(v) => updateTypography("headingFont", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEADING_FONTS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Body Font</Label>
            <Select
              value={typography.bodyFont || "Inter"}
              onValueChange={(v) => updateTypography("bodyFont", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BODY_FONTS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Scale</Label>
            <Select
              value={typography.scale || "default"}
              onValueChange={(v) => updateTypography("scale", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPOGRAPHY_SCALES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Logo
        </h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Logo URL</Label>
            <Input
              className="h-8 text-xs"
              placeholder="https://example.com/logo.png"
              value={logo.url || ""}
              onChange={(e) => updateLogo("url", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs">Placement</Label>
            <Select
              value={logo.placement || "none"}
              onValueChange={(v) => updateLogo("placement", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs"
        onClick={() => onChange({})}
      >
        Reset Brand Kit
      </Button>
    </div>
  );
}
