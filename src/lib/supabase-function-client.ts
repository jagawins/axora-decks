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
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: options?.headers,
    });

    // Handle Supabase SDK error object (not thrown)
    if (error) {
      return {
        data: null,
        error: error.message ?? "Function invocation failed",
        status: 500,
      };
    }

    // Some functions return { error: "...", requestId?: "..." } as 200
    if (data && typeof data === "object" && "error" in data && data.error) {
      return {
        data: null,
        error: String(data.error),
        status: 400,
        requestId: (data as Record<string, unknown>).requestId as string | undefined,
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
