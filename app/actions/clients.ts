"use server";

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneForAuth } from "@/lib/phone";
import type { ConditionType, CheckinConfig } from "@/lib/mock-data/clients";

function generatePasscode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export type CreateClientResult =
  | { success: true; passcode: string; client: any }
  | { success: false; error: string };

export async function createClientAccount(input: {
  name: string;
  initials: string;
  phone: string;
  condition: ConditionType;
  planType: string;
  programDurationMonths?: number | null;
  checkinConfig: CheckinConfig;
}): Promise<CreateClientResult> {
  // Auth check happens against the cookie-bound, RLS-respecting server
  // client — NOT the admin client. Only a logged-in Zainab can reach past
  // this point; the admin client below is used strictly for the one step
  // that genuinely needs elevated privilege (creating the auth user).
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not logged in." };
  }

  const { data: nutritionistRow } = await supabase
    .from("nutritionists")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!nutritionistRow) {
    return { success: false, error: "Only Zainab's account can add clients." };
  }

  const normalizedPhone = normalizePhoneForAuth(input.phone);
  const passcode = generatePasscode();
  const admin = createAdminClient();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    phone: normalizedPhone,
    password: passcode,
    phone_confirm: true, // pre-confirmed — no SMS ever sent, see lib/supabase/admin.ts
  });

  if (authError || !authUser.user) {
    const alreadyExists = authError?.message?.toLowerCase().includes("already registered");
    return {
      success: false,
      error: alreadyExists
        ? "This phone number is already registered to an account."
        : `Couldn't create the account. ${authError?.message ?? "Unknown error."}`,
    };
  }

  const { data: clientRow, error: insertError } = await supabase
    .from("clients")
    .insert({
      nutritionist_id: nutritionistRow.id,
      auth_user_id: authUser.user.id,
      name: input.name,
      initials: input.initials,
      phone: input.phone, // display format kept as typed; normalizedPhone is what auth actually stores
      condition: input.condition,
      plan_type: input.planType || "General nutrition",
      program_duration_months: input.programDurationMonths ?? null,
      checkin_config: input.checkinConfig,
    })
    .select()
    .single();

  if (insertError || !clientRow) {
    // Roll back the orphaned auth user — otherwise this phone number is
    // permanently stuck as "already registered" with no client record to
    // show for it, and Zainab has no way to retry.
    await admin.auth.admin.deleteUser(authUser.user.id);
    return {
      success: false,
      error: "Account was created but saving the client profile failed. Please try again.",
    };
  }

  return { success: true, passcode, client: clientRow };
}