/**
 * Supabase phone auth requires E.164 format WITHOUT a leading "+"
 * (regex enforced server-side: ^[1-9][0-9]{1,14}$). The mock data and any
 * form input use human-readable formats like "+91 98765 43210" — this
 * strips everything down to digits only. If the input has no country
 * code (10 digits, India-length), assumes +91 per the app's audience.
 *
 * Deliberately has zero imports — safe to use from both Client Components
 * (login form input) and server-only code (lib/supabase/admin.ts), unlike
 * admin.ts itself which must never be imported into browser code.
 */
export function normalizePhoneForAuth(rawPhone: string): string {
  const digitsOnly = rawPhone.replace(/\D/g, "");
  if (digitsOnly.length === 10) return `91${digitsOnly}`;
  return digitsOnly.replace(/^0+/, ""); // strip any leading trunk-prefix zero
}