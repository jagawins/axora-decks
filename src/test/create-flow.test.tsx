/**
 * Integration coverage for the creation hand-off.
 *
 * These exercise the behaviours plain helper tests missed: a failed block
 * insert, empty generator output, a reload after edits, and storage that is
 * unavailable. In every failure case the brief must survive and the user must
 * not be told the deck was created.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import {
  saveCreateDraft,
  readCreateDraft,
  DRAFT_STORAGE_KEY,
  MAX_PROMPT_LENGTH,
} from "@/lib/create-draft";

/* ── mocks ─────────────────────────────────────────────────────── */

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1", email: "leader@example.com" }, session: {}, loading: false }),
}));

vi.mock("@/components/landing/Navbar", () => ({ default: () => null }));
vi.mock("@/components/create/ResearchModeWizard", () => ({ default: () => null }));

const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

const generateMock = vi.fn();
vi.mock("@/lib/ai-engine", () => ({
  aiEngine: {
    generateFromPrompt: (...args: unknown[]) => generateMock(...args),
  },
}));

/** Supabase test double: projects insert succeeds, blocks insert is scripted. */
let blocksInsertError: { message: string } | null = null;
const blocksInsertCalls: unknown[][] = [];
const projectInserts: unknown[] = [];
const projectUpdates: unknown[] = [];
let projectLookupError: { message: string } | null = null;
let projectUpdateError: { message: string } | null = null;

vi.mock("@/integrations/supabase/client", () => {
  const client = {
    from: (table: string) => {
      if (table === "projects") {
        return {
          insert: (payload: unknown) => {
            projectInserts.push(payload);
            return {
              select: () => ({
                single: async () => ({ data: { id: "project-1" }, error: null }),
              }),
            };
          },
          update: (payload: unknown) => {
            projectUpdates.push(payload);
            return { eq: async () => ({ error: projectUpdateError }) };
          },
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: { id: "project-1" }, error: projectLookupError }) }),
            // profiles brand_kit lookup
            single: async () => ({ data: null, error: null }),
          }),
        };
      }
      if (table === "blocks") {
        return {
          insert: async (payload: unknown[]) => {
            blocksInsertCalls.push(payload);
            return { error: blocksInsertError };
          },
        };
      }
      // profiles and anything else
      return {
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
        insert: async () => ({ error: null }),
      };
    },
    functions: { invoke: async () => ({ data: null, error: null }) },
  };
  return { supabase: client };
});

import Create from "@/pages/Create";

const renderCreate = (entry = "/create") =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Create />
      </MemoryRouter>
    </HelmetProvider>
  );

const validBlocks = {
  blocks: [
    { type: "hero", content: { title: "Recommendation", subtitle: "Approve the plan" } },
    { type: "list", content: { title: "Evidence", items: ["One", "Two"] } },
  ],
};

beforeEach(() => {
  window.sessionStorage.clear();
  navigateMock.mockReset();
  toastMock.mockReset();
  generateMock.mockReset();
  blocksInsertError = null;
  blocksInsertCalls.length = 0;
  projectInserts.length = 0;
  projectUpdates.length = 0;
  projectLookupError = null;
  projectUpdateError = null;
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

const generateButton = () => screen.getByRole("button", { name: /generate deck/i });

/**
 * Returns the brief field. It must already be present: /create opens straight
 * onto the usable form, with no mandatory entry click.
 */
const openBrief = async (_user?: ReturnType<typeof userEvent.setup>) => {
  return (await waitFor(() => {
    const el = document.getElementById("prompt") as HTMLTextAreaElement | null;
    if (!el) throw new Error("brief field not shown");
    return el;
  })) as HTMLTextAreaElement;
};

describe("Create: the brief is immediately usable", () => {
  it("shows the brief field and one primary action without any entry click", async () => {
    renderCreate();
    expect(document.getElementById("prompt")).toBeTruthy();
    expect(generateButton()).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /start from scratch/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /back to options/i })).toBeNull();
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("keeps Customize closed but keyboard reachable, and other ways to create available", async () => {
    const user = userEvent.setup();
    renderCreate();
    const customize = screen.getByRole("button", { name: /^customize$/i });
    expect(customize).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("cards-count")).toBeNull();

    customize.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(customize).toHaveAttribute("aria-expanded", "true"));
    expect(document.getElementById("cards-count")).toBeTruthy();

    const more = screen.getByRole("button", { name: /more ways to create/i });
    expect(more).toHaveAttribute("aria-expanded", "false");
    await user.click(more);
    expect(await screen.findByRole("button", { name: /research mode/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /use a template/i })).toBeInTheDocument();
  });

  it("states the free-plan limits and the Pro export requirement next to the action", async () => {
    renderCreate();
    expect(screen.getByText(/10 decks and 10 AI generations/i)).toBeInTheDocument();
    expect(screen.getByText(/require Pro/i)).toBeInTheDocument();
  });
});

describe("Create: configuration presets", () => {
  it("never overwrites the brief and changes the visible summary", async () => {
    const user = userEvent.setup();
    renderCreate();
    const field = await openBrief();
    await user.type(field, "Our strategy for next year");

    // Executive update is the recommended default state.
    expect(screen.getByRole("button", { name: /executive update/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await user.click(screen.getByRole("button", { name: /strategy review/i }));
    expect(field.value).toBe("Our strategy for next year");
    await waitFor(() => expect(screen.getByText("8 slides")).toBeInTheDocument());
  });

  it("sends the preset slide count to the generation engine", async () => {
    const user = userEvent.setup();
    generateMock.mockResolvedValue(validBlocks);
    renderCreate();
    await user.type(await openBrief(), "Strategy review for the exec team");
    await user.click(screen.getByRole("button", { name: /strategy review/i }));
    await user.click(generateButton());
    await waitFor(() => expect(generateMock).toHaveBeenCalled());
    expect(generateMock.mock.calls[0][0]).toMatchObject({ slideCount: 8 });
  });

  it("shows Custom for a restored draft whose settings match no preset", async () => {
    saveCreateDraft("Restored custom brief", { cardsCount: 15, density: "plenty" });
    renderCreate();
    const field = await openBrief();
    await waitFor(() => expect(field.value).toBe("Restored custom brief"));
    expect(screen.getByText(/^Custom:$/)).toBeInTheDocument();
    expect(screen.getByText("15 slides")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /executive update/i })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});

describe("Create: generation failures keep the brief", () => {
  it("does not navigate or clear the draft when the block insert fails", async () => {
    const user = userEvent.setup();
    generateMock.mockResolvedValue(validBlocks);
    blocksInsertError = { message: "permission denied" };

    renderCreate();
    const field = await openBrief(user);
    await user.type(field, "Board update for Q4");

    await user.click(generateButton());

    await waitFor(() => expect(blocksInsertCalls.length).toBe(1));
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/failed/i) })
      )
    );
    expect(navigateMock).not.toHaveBeenCalledWith(expect.stringContaining("/preview/"));
    expect(readCreateDraft()?.prompt).toBe("Board update for Q4");
  });

  it("treats empty generator output as a failure and keeps the brief", async () => {
    const user = userEvent.setup();
    generateMock.mockResolvedValue({ blocks: [] });

    renderCreate();
    await user.type(await openBrief(user), "Investor pitch narrative");
    await user.click(generateButton());

    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/failed/i) })
      )
    );
    expect(blocksInsertCalls.length).toBe(0);
    expect(navigateMock).not.toHaveBeenCalledWith(expect.stringContaining("/preview/"));
    expect(readCreateDraft()?.prompt).toBe("Investor pitch narrative");
  });

  it("reuses the pending project on retry instead of creating another one", async () => {
    const user = userEvent.setup();
    generateMock.mockResolvedValue({ blocks: [] });

    renderCreate();
    await user.type(await openBrief(user), "Strategy review");
    await user.click(generateButton());
    await waitFor(() => expect(projectInserts.length).toBe(1));

    await user.click(generateButton());
    await waitFor(() => expect(generateMock).toHaveBeenCalledTimes(2));
    expect(projectInserts.length).toBe(1);
    // Retry refreshes the existing deck's metadata rather than duplicating it.
    expect(projectUpdates.length).toBe(1);
  });

  it("does not create a duplicate deck when the pending-project lookup errors", async () => {
    const user = userEvent.setup();
    generateMock.mockResolvedValue({ blocks: [] });

    renderCreate();
    await user.type(await openBrief(user), "Board review");
    await user.click(generateButton());
    await waitFor(() => expect(projectInserts.length).toBe(1));

    projectLookupError = { message: "network error" };
    await user.click(generateButton());
    await waitFor(() =>
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/failed/i) })
      )
    );
    expect(projectInserts.length).toBe(1);
    expect(generateMock).toHaveBeenCalledTimes(1);
    expect(readCreateDraft()?.prompt).toBe("Board review");
  });

  it("passes the chosen card count to the generator", async () => {
    const user = userEvent.setup();
    generateMock.mockResolvedValue(validBlocks);

    renderCreate();
    await user.type(await openBrief(user), "Quarterly review");
    await user.click(generateButton());

    await waitFor(() => expect(generateMock).toHaveBeenCalled());
    expect(generateMock.mock.calls[0][0]).toMatchObject({ slideCount: 10 });
  });
});

describe("Create: draft durability", () => {
  it("autosaves edits and settings so a reload restores the latest brief", async () => {
    const user = userEvent.setup();
    saveCreateDraft("Original brief", { cardsCount: 8 });

    const first = renderCreate();
    const field = await openBrief(user);
    await waitFor(() => expect(field.value).toBe("Original brief"));

    await user.type(field, " — revised for the board");
    await waitFor(() =>
      expect(readCreateDraft()?.prompt).toBe("Original brief — revised for the board")
    );
    expect(readCreateDraft()?.settings.cardsCount).toBe(8);

    // simulate a reload
    first.unmount();
    renderCreate();
    const reloaded = await openBrief(user);
    await waitFor(() =>
      expect(reloaded.value).toBe("Original brief — revised for the board")
    );
  });

  it("round-trips a long, indented brief without losing formatting", async () => {
    const brief = ["Board update.", "", "    Indented    note", "Detail: " + "z".repeat(4200)].join("\n");
    saveCreateDraft(brief);
    renderCreate();
    const field = await waitFor(() => document.getElementById("prompt") as HTMLTextAreaElement);
    await waitFor(() => expect(field.value).toBe(brief));
  });

  it("keeps the typed brief visible and warns when storage is unavailable", async () => {
    const user = userEvent.setup();
    const real = window.sessionStorage;
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new Error("storage disabled");
      },
    });
    try {
      renderCreate();
      const field = await openBrief(user);
      await user.type(field, "Brief typed without storage");
      expect(field.value).toBe("Brief typed without storage");
      expect(
        screen.getByText(/blocking storage/i)
      ).toBeInTheDocument();
      expect(generateButton()).toBeEnabled();
    } finally {
      Object.defineProperty(window, "sessionStorage", { configurable: true, value: real });
    }
  });

  it("keeps an over-limit URL brief in full, blocks generation and does not store it", async () => {
    const long = "L".repeat(MAX_PROMPT_LENGTH + 250);
    renderCreate(`/create?prompt=${encodeURIComponent(long)}`);
    const field = await waitFor(() => document.getElementById("prompt") as HTMLTextAreaElement);
    // Nothing is truncated away.
    expect(field.value.length).toBe(long.length);
    expect(await screen.findByRole("alert")).toHaveTextContent(/longer than/i);
    expect(generateButton()).toBeDisabled();
    await waitFor(() => expect(window.sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeNull());
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("restores a brief with edge whitespace exactly", async () => {
    const brief = "   First line\n\t";
    saveCreateDraft(brief);
    renderCreate();
    const field = await waitFor(() => document.getElementById("prompt") as HTMLTextAreaElement);
    await waitFor(() => expect(field.value).toBe(brief));
  });

  it("never writes the brief into the URL", async () => {
    const user = userEvent.setup();
    generateMock.mockResolvedValue({ blocks: [] });
    renderCreate();
    await user.type(await openBrief(user), "Confidential brief");
    await user.click(generateButton());
    await waitFor(() => expect(generateMock).toHaveBeenCalled());
    for (const call of navigateMock.mock.calls) {
      expect(String(call[0])).not.toContain("Confidential");
    }
    expect(window.sessionStorage.getItem(DRAFT_STORAGE_KEY)).toBeTruthy();
  });
});
