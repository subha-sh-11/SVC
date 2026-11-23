import { NextResponse } from "next/server";

const CATEGORIES = new Set(["Production", "Distribution", "Media & press", "Other"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Receives contact-form enquiries.
 * TODO: route to SVC's approved business inbox (e.g. an email provider or CRM)
 * once the address and routing rules are supplied. Until then enquiries are
 * only validated and logged on the server.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: silently accept bot submissions without processing them.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const category = String(body.category ?? "Other");

  if (!name || name.length > 120) return NextResponse.json({ error: "Please enter your name." }, { status: 422 });
  if (!EMAIL.test(email) || email.length > 200) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
  if (message.length < 10 || message.length > 5000) return NextResponse.json({ error: "Please write a message of at least 10 characters." }, { status: 422 });
  if (!CATEGORIES.has(category)) return NextResponse.json({ error: "Please choose an enquiry type." }, { status: 422 });

  console.info("[enquiry]", {
    category,
    name,
    email,
    organisation: String(body.organisation ?? "").slice(0, 200),
    phone: String(body.phone ?? "").slice(0, 40),
    message: message.slice(0, 5000),
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
