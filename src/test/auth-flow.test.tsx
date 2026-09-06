/**
 * Integration coverage for the sign-up hand-off:
 * - the "new signup" intent must exist before the signUp call can resolve,
 *   because the auth-state callback can fire first;
 * - a saved brief or an explicit ?next must reach the confirmation callback;
 * - only one place performs the redirect.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { saveCreateDraft } from "@/lib/create-draft";

const NEW_SIGNUP_FLAG = "axiva_new_signup";

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/integrations/lovable/index", () => ({ lovable: {} }));

/** Recorded state at the moment signUp was invoked. */
let flagAtCall: string | null = null;
let returnPathAtCall: string | undefined;
let authUser: { id: string } | null = null;

const signUpMock = vi.fn(async (_e: string, _p: string, _n?: string, returnPath?: string) => {
  flagAtCall = sessionStorage.getItem(NEW_SIGNUP_FLAG);
  returnPathAtCall = returnPath;
  return { error: null };
});

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: authUser,
    session: authUser ? {} : null,
    loading: false,
    signIn: vi.fn(async () => ({ error: null })),
    signUp: signUpMock,
    signInWithGoogle: vi.fn(),
    signInWithApple: vi.fn(),
    signInWithMicrosoft: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signOut: vi.fn(),
  }),
}));

import Auth from "@/pages/Auth";

const renderAuth = (search: string) =>
  render(
    <MemoryRouter initialEntries={[`/auth${search}`]}>
      <Auth />
    </MemoryRouter>
  );

beforeEach(() => {
  window.sessionStorage.clear();
  navigateMock.mockReset();
  signUpMock.mockClear();
  flagAtCall = null;
  returnPathAtCall = undefined;
  authUser = null;
});

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

const submitSignup = async () => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/email/i), "leader@example.com");
  await user.type(screen.getByLabelText(/password/i), "verysecret");
  await user.click(screen.getByRole("button", { name: /create account|sign up/i }));
};

describe("signup intent and destination", () => {
  it("marks the signup intent before signUp can resolve", async () => {
    renderAuth("?mode=signup");
    await submitSignup();
    await waitFor(() => expect(signUpMock).toHaveBeenCalled());
    expect(flagAtCall).toBe("1");
  });

  it("carries a saved brief destination into the confirmation callback", async () => {
    saveCreateDraft("Board update for Q4");
    renderAuth("?mode=signup");
    await submitSignup();
    await waitFor(() => expect(signUpMock).toHaveBeenCalled());
    expect(returnPathAtCall).toBe("/create");
  });

  it("carries a validated next destination and rejects an external one", async () => {
    renderAuth("?mode=signup&next=%2Fdashboard");
    await submitSignup();
    await waitFor(() => expect(returnPathAtCall).toBe("/dashboard"));

    cleanup();
    signUpMock.mockClear();
    renderAuth("?mode=signup&next=https%3A%2F%2Fevil.example");
    await submitSignup();
    await waitFor(() => expect(signUpMock).toHaveBeenCalled());
    expect(returnPathAtCall).toBeUndefined();
  });

  it("sends a signed-in visitor with a saved brief back to the builder", async () => {
    saveCreateDraft("Investor pitch");
    authUser = { id: "user-1" };
    renderAuth("");
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/create", { replace: true })
    );
  });

  it("sends a brand-new signup without a brief through onboarding", async () => {
    window.sessionStorage.setItem(NEW_SIGNUP_FLAG, "1");
    authUser = { id: "user-1" };
    renderAuth("");
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/onboarding", { replace: true })
    );
  });

  it("honours an explicit validated next over onboarding", async () => {
    window.sessionStorage.setItem(NEW_SIGNUP_FLAG, "1");
    authUser = { id: "user-1" };
    renderAuth("?next=%2Fdashboard");
    await waitFor(() =>
      expect(navigateMock).toHaveBeenCalledWith("/dashboard", { replace: true })
    );
  });
});
