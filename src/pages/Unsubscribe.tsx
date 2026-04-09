import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import SeoHead from "@/components/SeoHead";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type State = "loading" | "valid" | "already" | "invalid" | "confirming" | "done" | "error";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${token}`, {
      headers: { apikey: anonKey },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setState("already");
        } else if (data.valid) {
          setState("valid");
        } else {
          setState("invalid");
        }
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const handleConfirm = async () => {
    setState("confirming");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", {
        body: { token },
      });
      if (error) throw error;
      if (data?.success) {
        setState("done");
      } else if (data?.reason === "already_unsubscribed") {
        setState("already");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  return (
    <>
      <SeoHead title="Unsubscribe | AXIVA" description="Manage your email preferences" noIndex />
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {state === "loading" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Verifying…</p>
            </>
          )}

          {state === "valid" && (
            <>
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
              <h1 className="text-xl font-semibold text-foreground">Unsubscribe from emails?</h1>
              <p className="text-muted-foreground text-sm">
                You will no longer receive app emails from AXIVA.
              </p>
              <Button onClick={handleConfirm} variant="destructive">
                Confirm Unsubscribe
              </Button>
            </>
          )}

          {state === "confirming" && (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Processing…</p>
            </>
          )}

          {state === "done" && (
            <>
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
              <h1 className="text-xl font-semibold text-foreground">You've been unsubscribed</h1>
              <p className="text-muted-foreground text-sm">
                You will no longer receive app emails from AXIVA.
              </p>
            </>
          )}

          {state === "already" && (
            <>
              <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto" />
              <h1 className="text-xl font-semibold text-foreground">Already unsubscribed</h1>
              <p className="text-muted-foreground text-sm">
                This email address has already been unsubscribed.
              </p>
            </>
          )}

          {state === "invalid" && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <h1 className="text-xl font-semibold text-foreground">Invalid link</h1>
              <p className="text-muted-foreground text-sm">
                This unsubscribe link is invalid or has expired.
              </p>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="h-10 w-10 text-destructive mx-auto" />
              <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
              <p className="text-muted-foreground text-sm">
                Please try again or contact support.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Unsubscribe;
