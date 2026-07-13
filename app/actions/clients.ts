"use server";

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneForAuth, phoneToSyntheticEmail } from "@/lib/phone";
import type { ConditionType, CheckinConfig } from "@/lib/mock-data/clients";
import type { MealConfig } from "@/lib/mealConfig";

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
  mealConfig?: MealConfig;
  customPasscode?: string;
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

  const syntheticEmail = phoneToSyntheticEmail(input.phone);

  // Re-validate here even though the form already checks this — a client-side
  // check can always be bypassed (devtools, direct call, etc).
  if (input.customPasscode && input.customPasscode.length < 4) {
    return { success: false, error: "Passcode must be at least 4 digits." };
  }
  const passcode = input.customPasscode?.trim() || generatePasscode();
  const admin = createAdminClient();

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email: syntheticEmail,
    password: passcode,
    email_confirm: true, // pre-confirmed — no email ever sent, see lib/phone.ts
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
      meal_config: input.mealConfig ?? {},
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

export type DeleteClientResult = { success: true } | { success: false; error: string };

export async function deleteClientAccount(clientId: string): Promise<DeleteClientResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not logged in." };

  const { data: nutritionistRow } = await supabase
    .from("nutritionists")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!nutritionistRow) return { success: false, error: "Only Zainab's account can delete clients." };

  const { data: clientRow } = await supabase
    .from("clients")
    .select("auth_user_id")
    .eq("id", clientId)
    .maybeSingle();
  if (!clientRow) return { success: false, error: "Client not found." };

  const { error: deleteRowError } = await supabase.from("clients").delete().eq("id", clientId);
  if (deleteRowError) {
    return { success: false, error: "Failed to delete client record." };
  }

  // Delete the row before the auth user, not after — clients.auth_user_id
  // references auth.users with no ON DELETE clause, so deleting the auth
  // user first would be blocked by the still-existing client row.
  if (clientRow.auth_user_id) {
    const admin = createAdminClient();
    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(clientRow.auth_user_id);
    if (deleteAuthError) {
      // Client record is already gone, matching what the UI now shows —
      // not failing the whole operation over a leftover orphaned auth
      // user, which is a cleanup concern rather than a user-facing one.
      console.error("Client row deleted but auth user deletion failed:", deleteAuthError.message);
    }
  }

  return { success: true };
}