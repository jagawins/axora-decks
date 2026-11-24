// src/lib/supabase-function-client.ts
import { supabase } from "@/integrations/supabase/client";

export type FunctionResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
  requestId?: string;
};

function safeJsonParse(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function invokeFunction<T>(
  functionName: string,
  body?: Record<string, unknown>,
  options?: { headers?: Record<string, string> }
): Promise<FunctionResponse<T>> {
  try {
    // Make sure a fresh signed-in token is sent; an expired session would
    // otherwise fall back to the public key and the function returns 401.
    if (!options?.headers?.Authorization) {
      const { data: sess } = await supabase.auth.getSession();
      const expiresAt = sess.session?.expires_at ?? 0;
      if (sess.session && expiresAt * 1000 < Date.now() + 60_000) {
        await supabase.auth.refreshSession();
      }
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: options?.headers,
    });

    // Handle Supabase SDK error object (not thrown): read the real response
    if (error) {
      const ctx = (error as { context?: Response }).context;
      const status = ctx?.status ?? 500;
      let message: string | undefined;
      let requestId: string | undefined;
      if (ctx && typeof ctx.text === "function") {
        try {
          const parsed = safeJsonParse(await ctx.text());
          message = (parsed?.error as string) || (parsed?.message as string) || undefined;
          requestId = parsed?.requestId as string | undefined;
        } catch {
          /* body already read or unavailable */
        }
      }
      if (status === 401) {
        message = "Your sign-in has expired. Please sign in again — your brief is kept.";
      } else if (status === 429) {
        message = message || "Too many requests right now. Please wait a moment and try again.";
      } else if (status === 402) {
        message = message || "AI usage limit reached. Please try again later.";
      }
      return {
        data: null,
        error: message ?? error.message ?? "Function invocation failed",
        status,
        requestId,
      };
    }

    // Some functions return { error: "...", requestId?: "..." } as 200
    // But preserve requires_passcode responses so PublicPreview can handle them
    if (data && typeof data === "object" && "error" in data && data.error) {
      const dataObj = data as Record<string, unknown>;
      if (dataObj.requires_passcode) {
        return {
          data: data as T,
          error: null,
          status: 403,
          requestId: dataObj.requestId as string | undefined,
        };
      }
      return {
        data: null,
        error: String(dataObj.error),
        status: 400,
        requestId: dataObj.requestId as string | undefined,
      };
    }

    return {
      data: data as T,
      error: null,
      status: 200,
      requestId: (data as Record<string, unknown>)?.requestId as string | undefined,
    };
  } catch (err: unknown) {
    const error = err as Error & { name?: string; context?: Response };
    const name = error?.name;

    // FunctionsHttpError: read the Response body from err.context
    if (name === "FunctionsHttpError" && error.context) {
      const res: Response = error.context;
      const status = res.status ?? 500;

      try {
        const text = await res.text();
        const parsed = safeJsonParse(text);

        return {
          data: null,
          error:
            (parsed?.error as string) ||
            (parsed?.message as string) ||
            text ||
            `${functionName} failed with status ${status}`,
          status,
          requestId: parsed?.requestId as string | undefined,
        };
      } catch {
        return {
          data: null,
          error: `${functionName} failed with status ${status}`,
          status,
        };
      }
    }

    if (name === "FunctionsRelayError") {
      return { data: null, error: "Edge function unreachable or not deployed", status: 503 };
    }

    if (name === "FunctionsFetchError") {
      return { data: null, error: "Network error connecting to edge function", status: 0 };
    }

    return { data: null, error: error?.message ?? "Unknown error", status: 500 };
  }
}
