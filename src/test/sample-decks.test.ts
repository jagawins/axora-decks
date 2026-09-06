import { describe, it, expect } from "vitest";
import { SAMPLE_DECKS, resolveSampleDeck, getSampleDeck } from "@/data/sample-decks";

describe("sample decks", () => {
  it("provides four inspectable decks with unique ids", () => {
    expect(SAMPLE_DECKS.length).toBe(4);
    const ids = new Set(SAMPLE_DECKS.map((d) => d.id));
    expect(ids.size).toBe(4);
  });

  it("every deck demonstrates recommendation, risks and next steps", () => {
    for (const deck of SAMPLE_DECKS) {
      const kinds = deck.slides.map((s) => s.body.kind);
      expect(kinds).toContain("recommendation");
      expect(kinds).toContain("risks");
      expect(kinds).toContain("next_steps");
      expect(deck.slides.length).toBeGreaterThanOrEqual(5);
      for (const slide of deck.slides) {
        expect(slide.speakerNote.length).toBeGreaterThan(20);
        expect(slide.questions.length).toBeGreaterThan(0);
      }
    }
  });

  it("labels the sample companies as fictional", () => {
    for (const deck of SAMPLE_DECKS) {
      expect(deck.organisation.toLowerCase()).toContain("fictional");
    }
  });

  it("resolves a deck from a validated query parameter", () => {
    expect(resolveSampleDeck("investor-pitch").id).toBe("investor-pitch");
    expect(resolveSampleDeck(" Strategy-Review ").id).toBe("strategy-review");
  });

  it("falls back to the first deck for unknown or hostile values", () => {
    expect(resolveSampleDeck("../../etc/passwd").id).toBe(SAMPLE_DECKS[0].id);
    expect(resolveSampleDeck(null).id).toBe(SAMPLE_DECKS[0].id);
    expect(resolveSampleDeck("<script>").id).toBe(SAMPLE_DECKS[0].id);
  });

  it("looks decks up by id", () => {
    expect(getSampleDeck("board-update")?.title).toBeTruthy();
    expect(getSampleDeck("nope")).toBeUndefined();
  });
});
