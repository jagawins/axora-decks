/**
 * Focused coverage for the export entry point and the Create page's primary
 * action ordering. These use test doubles only — no real session, no real
 * database, no real generation.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ExportMenu } from "@/components/ExportMenu";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1", email: "leader@example.com" }, session: {}, loading: false }),
}));
vi.mock("@/components/create/ResearchModeWizard", () => ({ default: () => null }));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

const generateMock = vi.fn();
vi.mock("@/lib/ai-engine", () => ({
  aiEngine: { generateFromPrompt: (...a: unknown[]) => generateMock(...a) },
}));

vi.mock("@/integrations/supabase/client", () => {
  const chain = {
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
      }),
      single: async () => ({ data: null, error: null }),
    }),
    insert: async () => ({ error: null }),
    update: () => ({ eq: async () => ({ error: null }) }),
  };
  return { supabase: { from: () => chain, functions: { invoke: async () => ({ data: null, error: null }) } } };
});

import Create from "@/pages/Create";

beforeEach(() => {
  window.sessionStorage.clear();
  generateMock.mockReset();
});
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

describe("Editor export entry point", () => {
  it("exposes a labelled Export menu with both PDF and PowerPoint, reusing the given handlers", async () => {
    const user = userEvent.setup();
    const onPrintPDF = vi.fn();
    const onExportPPTX = vi.fn();
    render(
      <ExportMenu
        onPrintPDF={onPrintPDF}
        onExportPPTX={onExportPPTX}
        onShareLink={vi.fn()}
        onPresenterView={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /export/i }));
    const pdf = await screen.findByRole("menuitem", { name: /export as pdf/i });
    const pptx = screen.getByRole("menuitem", { name: /export as powerpoint/i });

    await user.click(pdf);
    expect(onPrintPDF).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: /export/i }));
    await user.click(await screen.findByRole("menuitem", { name: /export as powerpoint/i }));
    expect(onExportPPTX).toHaveBeenCalledTimes(1);
    expect(pptx).toBeTruthy();
  });

  it("mounts that same menu in the editor header at both breakpoints with the real handlers, and has no fake export progress", () => {
    const src = readFileSync("src/pages/Editor.tsx", "utf8");
    const mounts = src.match(/<ExportMenu/g) ?? [];
    expect(mounts.length).toBe(2);
    expect(src).toContain("onPrintPDF={exportPdf}");
    expect(src).toContain("onExportPPTX={exportPptx}");
    // The fake "Optimizing/Aligning/Applying typography" delay is gone.
    expect(src).not.toContain("Optimizing slide formatting");
    expect(src).not.toContain("exportStage");
  });
});

describe("Create page primary action", () => {
  it("places the single primary action before the optional preset section", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/create"]}>
          <Create />
        </MemoryRouter>
      </HelmetProvider>
    );

    const cta = await waitFor(() => screen.getByRole("button", { name: /generate deck/i }));
    const preset = screen.getByRole("button", { name: /executive update/i });
    // Node.compareDocumentPosition: 4 === preset follows the CTA in the DOM.
    expect(cta.compareDocumentPosition(preset) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Exactly one focusable primary generate control.
    expect(screen.getAllByRole("button", { name: /generate deck/i })).toHaveLength(1);
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("presents plan limits as general information, not as the signed-in person's plan", async () => {
    render(
      <HelmetProvider>
        <MemoryRouter initialEntries={["/create"]}>
          <Create />
        </MemoryRouter>
      </HelmetProvider>
    );
    expect(await screen.findByText(/free plan:/i)).toBeInTheDocument();
    expect(screen.queryByText(/your free plan/i)).toBeNull();
  });
});
