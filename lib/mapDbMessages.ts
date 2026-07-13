import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/mock-data/messages";

/**
 * Fetches a client's full message history and maps it into the Message[]
 * shape the chat UI already expects. For voice messages, generates a
 * signed URL (1 hour expiry) from the private voice-notes bucket — a
 * direct/public URL doesn't work since the bucket is private, and a blob
 * URL only ever exists in the sender's own browser session, never
 * persisted. Shared between both chat pages so their loading logic can't
 * drift apart.
 */
export async function loadMessagesForClient(clientId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data: rows, error } = await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("sent_at", { ascending: true });

  if (error || !rows) return [];

  const messages: Message[] = [];
  for (const row of rows) {
    let audioUrl: string | undefined;
    if (row.audio_path) {
      const { data: signed } = await supabase.storage
        .from("voice-notes")
        .createSignedUrl(row.audio_path, 3600);
      audioUrl = signed?.signedUrl;
    }

    messages.push({
      id: row.id,
      sender: row.sender,
      text: row.text ?? "",
      time: new Date(row.sent_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      audioUrl,
      audioDuration: row.audio_duration ?? undefined,
    });
  }

  return messages;
}