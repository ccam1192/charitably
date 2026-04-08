"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Completes email invite / magic-link / OAuth redirects.
 * Handles: ?code= (PKCE), hash tokens (implicit), or existing session after client init.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const supabase = createClient();

    async function finish() {
      try {
        const {
          data: { session: existing },
        } = await supabase.auth.getSession();
        if (existing) {
          router.replace("/dashboard");
          return;
        }

        const hash = window.location.hash.replace(/^#/, "");
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          const access_token = hashParams.get("access_token");
          const refresh_token = hashParams.get("refresh_token");
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (!error) {
              window.history.replaceState(null, "", window.location.pathname + window.location.search);
              router.replace("/dashboard");
              return;
            }
            setMessage(error.message);
            router.replace("/login?error=" + encodeURIComponent(error.message));
            return;
          }
        }

        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            router.replace("/dashboard");
            return;
          }
          setMessage(error.message);
          router.replace("/login?error=" + encodeURIComponent(error.message));
          return;
        }

        const err =
          searchParams.get("error_description") ||
          searchParams.get("error") ||
          "Could not complete sign-in.";
        router.replace("/login?error=" + encodeURIComponent(err));
      } catch {
        router.replace("/login?error=" + encodeURIComponent("Sign-in failed."));
      }
    }

    void finish();
  }, [router]);

  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center">
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
