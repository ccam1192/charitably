import { NextResponse } from "next/server";
import { createServiceRoleClientIfConfigured } from "@/lib/supabase/admin";

type Payload = {
  name: string;
  email: string;
  organization: string;
  message?: string;
};

export async function POST(req: Request) {
  let body: Payload | null = null;

  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const organization = body?.organization?.trim() ?? "";
  const message = (body?.message ?? "").trim();

  const emailOk = /^\S+@\S+\.\S+$/.test(email);

  if (name.length < 2 || !emailOk || organization.length < 2) {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const supabase = createServiceRoleClientIfConfigured();
  if (!supabase) {
    console.error("[request-access] SUPABASE_SERVICE_ROLE_KEY is not set; cannot store submission");
    return NextResponse.json(
      { error: "Contact form is not configured on the server. Please try again later." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("access_requests").insert({
    name,
    email,
    organization,
    message: message.length > 0 ? message : null,
  });

  if (error) {
    console.error("[request-access] insert failed", error);
    return NextResponse.json({ error: "Could not save your request. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

