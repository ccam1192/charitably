import { NextResponse } from "next/server";

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

  // Minimal handling for now: log server-side so it's captured in server logs.
  console.log("[request-access]", {
    name,
    email,
    organization,
    message: message.length ? message : undefined,
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

