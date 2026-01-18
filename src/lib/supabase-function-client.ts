import { supabase } from "@/integrations/supabase/client";

export interface FunctionResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
  requestId?: string;
}

/**
 * Invokes a Supabase Edge Function with proper error handling.
 * Extracts the actual error message from the response body instead of 
 * returning the generic "Edge Function returned a non-2xx status code".
 */
export async function invokeFunction<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>,
  options?: { headers?: Record<string, string> }
): Promise<FunctionResponse<T>> {
  try {
    console.log(`[${functionName}] Invoking edge function`, { bodyKeys: body ? Object.keys(body) : [] });

    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: options?.headers,
    });

    // The Supabase client throws FunctionsHttpError for non-2xx responses
    // but the actual error details are in the response body
    if (error) {
      console.error(`[${functionName}] Invocation error:`, error);
      
      // The error.message is often just "Edge Function returned a non-2xx status code"
      // Try to get the actual error from the response context
      const errorContext = (error as any).context;
      
      // Try to extract status from error
      const status = (error as any).status || (errorContext?.status) || 500;
      
      // Check if we have a JSON body in the error context
      if (errorContext && typeof errorContext === "object") {
        try {
          const bodyText = await errorContext.text?.();
          if (bodyText) {
            const parsed = JSON.parse(bodyText);
            return {
              data: null,
              error: parsed.error || error.message || "Function invocation failed",
              status,
              requestId: parsed.requestId,
            };
          }
        } catch {
          // Ignore parsing errors
        }
      }
      
      return {
        data: null,
        error: error.message || "Function invocation failed",
        status,
      };
    }

    // Success - check if response itself contains an error field
    if (data && typeof data === "object" && "error" in data && data.error) {
      console.error(`[${functionName}] Response contains error:`, data.error);
      return {
        data: null,
        error: data.error as string,
        status: 400,
        requestId: (data as any).requestId,
      };
    }

    console.log(`[${functionName}] Success`, { hasData: !!data });
    return {
      data: data as T,
      error: null,
      status: 200,
      requestId: (data as any)?.requestId,
    };

  } catch (err) {
    console.error(`[${functionName}] Unexpected error:`, err);
    
    // Handle FunctionsHttpError specifically
    if (err && typeof err === "object" && "name" in err) {
      const fetchError = err as { name: string; message?: string; context?: Response };
      
      if (fetchError.name === "FunctionsHttpError" && fetchError.context) {
        try {
          const response = fetchError.context;
          const status = response.status || 500;
          const bodyText = await response.text();
          
          console.error(`[${functionName}] HTTP Error ${status}:`, bodyText);
          
          try {
            const parsed = JSON.parse(bodyText);
            return {
              data: null,
              error: parsed.error || `${functionName} failed with status ${status}`,
              status,
              requestId: parsed.requestId,
            };
          } catch {
            return {
              data: null,
              error: bodyText || `${functionName} failed with status ${status}`,
              status,
            };
          }
        } catch (parseErr) {
          console.error(`[${functionName}] Failed to parse error response:`, parseErr);
        }
      }
      
      if (fetchError.name === "FunctionsRelayError") {
        return {
          data: null,
          error: "Edge function is not deployed or unreachable",
          status: 503,
        };
      }
      
      if (fetchError.name === "FunctionsFetchError") {
        return {
          data: null,
          error: "Network error connecting to edge function",
          status: 0,
        };
      }
    }
    
    return {
      data: null,
      error: err instanceof Error ? err.message : "Unknown error",
      status: 500,
    };
  }
}
