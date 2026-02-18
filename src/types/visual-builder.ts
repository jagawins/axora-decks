// Types for the Visual Builder image selection system

export type ImageSource = "stock" | "web" | "ai" | "illustration" | "gif" | "upload";
export type VisualDensity = "minimal" | "balanced" | "visual";

export interface ImageAsset {
  source: ImageSource;
  query?: string;
  url: string;
  thumbUrl?: string;
  credit?: string;
  license?: string;
  locked: boolean;
}

export interface ImageSlot {
  id: string;
  slideIndex: number;
  slideTitle: string;
  placement: "hero" | "background" | "inline";
  imageAsset?: ImageAsset;
  suggestedQuery?: string;
}

export interface ImageSearchResult {
  thumbUrl: string;
  url: string;
  credit?: string;
  license?: string;
  provider?: string;
}
