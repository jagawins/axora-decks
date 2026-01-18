// src/lib/supabase-function-client.ts
import { supabase } from "@/integrations/supabase/client";

export type FunctionResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
  requestId?: string;
};

function safeJsonParse(text: string): any | null {
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

    if (error) {
      // This is usually generic. Return it, but keep status as best effort.
      const status = (error as any)?.status ?? 500;
      return { data: null, error: error.message ?? "Function invocation failed", status };
    }

    // Some functions return { error: "...", requestId?: "..." } as 200
    if (data && typeof data === "object" && "error" in (data as any) && (data as any).error) {
      return {
        data: null,
        error: String((data as any).error),
        status: 400,
        requestId: (data as any).requestId,
      };
    }

    return { data: data as T, error: null, status: 200, requestId: (data as any)?.requestId };
  } catch (err: any) {
    const name = err?.name;

    if (name === "FunctionsHttpError" && err?.context) {
      const res: Response = err.context;
      const status = res.status ?? 500;
      const text = await res.text().catch(() => "");
      const parsed = safeJsonParse(text);

      return {
        data: null,
        error:
          (parsed && (parsed.error || parsed.message)) ||
          text ||
          `${functionName} failed with status ${status}`,
        status,
        requestId: parsed?.requestId,
      };
    }

    if (name === "FunctionsRelayError") {
      return { data: null, error: "Edge function unreachable or not deployed", status: 503 };
    }

    if (name === "FunctionsFetchError") {
      return { data: null, error: "Network error connecting to edge function", status: 0 };
    }

    return { data: null, error: err?.message ?? "Unknown error", status: 500 };
  }
}
