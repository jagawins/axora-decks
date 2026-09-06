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
          select: () => ({
            eq: () => ({ maybeSingle: async () => ({ data: { id: "project-1" }, error: null }) }),
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

const renderCreate = () =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={["/create"]}>
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
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

const generateButton = () => screen.getByRole("button", { name: /generate deck/i });

/** Opens the "start from scratch" form and returns the brief field. */
const openBrief = async (user: ReturnType<typeof userEvent.setup>) => {
  const existing = document.getElementById("prompt") as HTMLTextAreaElement | null;
  if (existing) return existing;
  await user.click(screen.getByRole("button", { name: /start from scratch/i }));
  return (await waitFor(() => {
    const el = document.getElementById("prompt") as HTMLTextAreaElement | null;
    if (!el) throw new Error("brief field not shown");
    return el;
  })) as HTMLTextAreaElement;
};

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
