import { Client } from "./mock-data/clients";

export interface DigestItem {
  type: "attention" | "win" | "new";
  clientId: string;
  clientName: string;
  text: string;
}

export function generateDigest(clients: Client[]): DigestItem[] {
  const items: DigestItem[] = [];

  for (const client of clients) {
    const firstName = client.name.split(" ")[0];

    if (client.status === "needs-attention") {
      items.push({
        type: "attention",
        clientId: client.id,
        clientName: firstName,
        text: `${firstName} hasn't logged in a few days`,
      });
    }

    if (client.status === "new") {
      items.push({
        type: "new",
        clientId: client.id,
        clientName: firstName,
        text: `${firstName} just started their plan`,
      });
    }

    const progress = client.progress;
    if (progress.length >= 2) {
      const last = progress[progress.length - 1];
      const prev = progress[progress.length - 2];
      if (last.bloating < prev.bloating - 1) {
        items.push({
          type: "win",
          clientId: client.id,
          clientName: firstName,
          text: `${firstName} reported less bloating this week`,
        });
      }
      if (last.weight < prev.weight - 0.4) {
        items.push({
          type: "win",
          clientId: client.id,
          clientName: firstName,
          text: `${firstName} is down ${(prev.weight - last.weight).toFixed(1)}kg since last week`,
        });
      }
    }
  }

  return items;
}

export function digestSummaryLine(clients: Client[]): string {
  const onTrack = clients.filter((c) => c.status === "on-track").length;
  const needsAttention = clients.filter((c) => c.status === "needs-attention").length;
  const parts: string[] = [];
  if (onTrack > 0) parts.push(`${onTrack} on track`);
  if (needsAttention > 0) parts.push(`${needsAttention} need${needsAttention === 1 ? "s" : ""} a nudge`);
  return parts.join(" · ");
}
