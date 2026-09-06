import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  saveCreateDraft,
  readCreateDraft,
  clearCreateDraft,
  readLegacyPrompt,
  safeInternalPath,
  DRAFT_STORAGE_KEY,
  LEGACY_PROMPT_KEY,
  DRAFT_TTL_MS,
  MAX_PROMPT_LENGTH,
} from "@/lib/create-draft";

describe("safeInternalPath", () => {
  it("accepts same-origin absolute paths", () => {
    expect(safeInternalPath("/create")).toBe("/create");
    expect(safeInternalPath("/create?prompt=hi")).toBe("/create?prompt=hi");
  });

  it("rejects external and protocol-relative destinations", () => {
    expect(safeInternalPath("https://evil.example/x")).toBe("/create");
    expect(safeInternalPath("//evil.example")).toBe("/create");
    expect(safeInternalPath("javascript:alert(1)")).toBe("/create");
    expect(safeInternalPath("/\\evil.example")).toBe("/create");
    expect(safeInternalPath("/%2f%2fevil.example")).toBe("/create");
  });

  it("rejects control characters and empty values", () => {
    expect(safeInternalPath("/cre\u0000ate")).toBe("/create");
    expect(safeInternalPath("")).toBe("/create");
    expect(safeInternalPath(null)).toBe("/create");
    expect(safeInternalPath(undefined, "/dashboard")).toBe("/dashboard");
  });

  it("honours a custom fallback", () => {
    expect(safeInternalPath("https://evil.example", "/dashboard")).toBe("/dashboard");
  });
});

describe("create draft round trip", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("saves and restores the prompt with validated settings", () => {
    expect(saveCreateDraft("Board update for Q4", { cardsCount: 12, density: "context", theme: "classic" })).toBe(true);
    const draft = readCreateDraft();
    expect(draft?.prompt).toBe("Board update for Q4");
    expect(draft?.settings.cardsCount).toBe(12);
    expect(draft?.settings.density).toBe("context");
    expect(draft?.settings.theme).toBe("classic");
  });

  it("drops invalid or out-of-range settings", () => {
    saveCreateDraft("Investor pitch", {
      // @ts-expect-error deliberately invalid input
      density: "extreme",
      cardsCount: 900,
      // @ts-expect-error deliberately invalid input
      visualsMode: "lasers",
    });
    const draft = readCreateDraft();
    expect(draft?.settings.density).toBeUndefined();
    expect(draft?.settings.cardsCount).toBeUndefined();
    expect(draft?.settings.visualsMode).toBeUndefined();
  });

  it("bounds the prompt length", () => {
    saveCreateDraft("x".repeat(MAX_PROMPT_LENGTH + 500));
    expect(readCreateDraft()?.prompt.length).toBe(MAX_PROMPT_LENGTH);
  });

  it("reading never clears the draft, so a failed generation keeps the brief", () => {
    saveCreateDraft("Strategy review");
    expect(readCreateDraft()?.prompt).toBe("Strategy review");
    // simulate a failed generation: nothing calls clear
    expect(readCreateDraft()?.prompt).toBe("Strategy review");
    expect(window.sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeTruthy();
  });

  it("clears only on explicit request", () => {
    saveCreateDraft("Strategy review");
    clearCreateDraft();
    expect(readCreateDraft()).toBeNull();
  });

  it("ignores an expired draft", () => {
    saveCreateDraft("Old brief");
    const later = Date.now() + DRAFT_TTL_MS + 1000;
    expect(readCreateDraft(later)).toBeNull();
  });

  it("ignores malformed or wrong-version payloads", () => {
    window.sessionStorage.setItem(DRAFT_STORAGE_KEY, "{not json");
    expect(readCreateDraft()).toBeNull();
    window.sessionStorage.setItem(
      DRAFT_STORAGE_KEY,
      JSON.stringify({ version: 99, prompt: "hi", createdAt: Date.now() })
    );
    expect(readCreateDraft()).toBeNull();
  });

  it("survives storage that throws", () => {
    const spy = vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    expect(saveCreateDraft("Board update")).toBe(false);
    expect(readCreateDraft()).toBeNull();
    expect(() => clearCreateDraft()).not.toThrow();
    spy.mockRestore();
  });

  it("reads the legacy prefill key for compatibility", () => {
    window.sessionStorage.setItem(LEGACY_PROMPT_KEY, "  Legacy board update  ");
    expect(readLegacyPrompt()).toBe("Legacy board update");
  });
});
