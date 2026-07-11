// One-time setup script — creates Zainab's real auth account (synthetic
// email + password, pre-confirmed) AND her linked nutritionists row, in one
// step. Uses a synthetic email rather than Supabase's Phone provider
// because Phone requires a configured SMS vendor (Twilio) to even enable
// in the dashboard, despite never sending an OTP — see lib/phone.ts for
// the full reasoning. She still logs in with her real phone number on the
// login page; this conversion is invisible to her.
//
// Run locally (never in a deployed environment):
//   node scripts/create-nutritionist.mjs "yourChosenPassword"
//
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY straight out of
// .env.local — no extra dependencies (no dotenv package needed).

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function loadEnvLocal() {
  const content = readFileSync(".env.local", "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    env[key] = value;
  }
  return env;
}

function normalizePhoneForAuth(rawPhone) {
  const digitsOnly = rawPhone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `91${digitsOnly}`;
  return digitsOnly.replace(/^0+/, "");
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local");
  process.exit(1);
}

// Edit these two if needed before running.
const NAME = "Zainab";
const DISPLAY_PHONE = "+91 75698 77113"; // shown in the nutritionists table, display only
const RAW_PHONE = "7569877113";

const normalizedPhone = normalizePhoneForAuth(RAW_PHONE);
const syntheticEmail = `${normalizedPhone}@zeeheal-app.local`;

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/create-nutritionist.mjs "yourChosenPassword"');
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: authUser, error: authError } = await admin.auth.admin.createUser({
  email: syntheticEmail,
  password,
  email_confirm: true, // pre-confirmed — no email ever sent
});

if (authError || !authUser.user) {
  console.error("Failed to create auth user:", authError?.message ?? "unknown error");
  process.exit(1);
}

console.log("Auth user created:", authUser.user.id);

const { error: insertError } = await admin.from("nutritionists").insert({
  id: authUser.user.id,
  name: NAME,
  phone: DISPLAY_PHONE,
});

if (insertError) {
  console.error("Auth user created, but the nutritionists insert failed:", insertError.message);
  console.error("You can insert it manually in the SQL Editor with id:", authUser.user.id);
  process.exit(1);
}

console.log(`Done. Zainab can log in with phone ${RAW_PHONE} (or +91 formatted) and the password you just set.`);
