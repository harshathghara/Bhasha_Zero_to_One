import { PRESET_AGENTS, SHOW_TITLE } from "./presets";
import { speechLabelFromEvent } from "./world/speechStyles";

const PRESET_BY_ID = new Map(PRESET_AGENTS.map((agent) => [agent.id, agent]));

function senderDisplayName(senderId, charactersById) {
  if (!senderId) return "Unknown";
  if (senderId === "game_master") return "Game Master";
  if (senderId === "narrator") return "Narrator";
  if (senderId === "producer") return "Producer";
  return charactersById.get(senderId)?.name || senderId;
}

function formatClock(timestamp) {
  if (!timestamp || timestamp <= 0) return null;
  const date = new Date(timestamp * (timestamp < 1e12 ? 1000 : 1));
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function buildCastEntries(contestants = []) {
  return contestants.map((contestant, index) => {
    const preset = PRESET_BY_ID.get(contestant.id);
    return {
      id: contestant.id,
      name: contestant.name,
      displayName: preset?.displayName || contestant.name,
      role: preset?.role || "",
      summary: preset?.summary || "",
      traits: preset?.traits ? [...preset.traits] : [],
      accent: preset?.accent || "#b5a5bd",
      spriteKey: `slot-${index + 1}`,
    };
  });
}

export function formatEventLine(event, charactersById) {
  const speaker = senderDisplayName(event.sender_id, charactersById);
  const label = speechLabelFromEvent(event);
  const clock = formatClock(event.timestamp);
  const recipients = (event.recipients || [])
    .map((id) => senderDisplayName(id, charactersById))
    .filter(Boolean);
  const to = recipients.length ? ` → ${recipients.join(", ")}` : "";
  const head = clock
    ? `[${clock}] ${speaker} · ${label}${to}`
    : `${speaker} · ${label}${to}`;
  return `${head}\n${event.text || ""}`.trimEnd();
}

function sortedRoundKeys(events, recaps, narratives) {
  const keys = new Set();
  for (const event of events || []) {
    if (event.round != null) keys.add(Number(event.round));
  }
  for (const key of Object.keys(recaps || {})) keys.add(Number(key));
  for (const key of Object.keys(narratives || {})) keys.add(Number(key));
  return [...keys].filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
}

export function buildTranscriptText({
  title = SHOW_TITLE,
  contestants = [],
  events = [],
  recaps = {},
  narratives = {},
} = {}) {
  const cast = buildCastEntries(contestants);
  const charactersById = new Map(contestants.map((c) => [c.id, c]));
  const rounds = sortedRoundKeys(events, recaps, narratives);
  const throughRound = rounds.length ? Math.max(...rounds) : 0;

  const lines = [
    `${String(title || SHOW_TITLE).toUpperCase()} — PRODUCER LOG`,
    "Full producer cut" + (throughRound ? ` · through Round ${throughRound}` : ""),
    "",
    "=== CAST ===",
  ];

  for (const member of cast) {
    lines.push("");
    lines.push(member.name);
    if (member.traits.length) {
      for (const trait of member.traits) {
        lines.push(`  - ${trait}`);
      }
    } else if (member.summary) {
      lines.push(`  - ${member.summary}`);
    }
  }

  for (const round of rounds) {
    lines.push("");
    lines.push(`=== ROUND ${round} ===`);
    const roundEvents = (events || [])
      .filter((event) => Number(event.round) === round)
      .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
    for (const event of roundEvents) {
      lines.push("");
      lines.push(formatEventLine(event, charactersById));
    }
    const recap = recaps?.[round] ?? recaps?.[String(round)];
    if (recap) {
      lines.push("");
      lines.push(`=== ROUND ${round} RECAP ===`);
      lines.push(recap);
    }
    const story = narratives?.[round] ?? narratives?.[String(round)];
    if (story) {
      lines.push("");
      lines.push(`=== ROUND ${round} STORY ===`);
      lines.push(story);
    }
  }

  return lines.join("\n").trim() + "\n";
}

export function transcriptFilename(showId, throughRound = 0, ext = "txt") {
  const id = (showId || "show").replace(/[^\w-]+/g, "-");
  const roundPart = throughRound > 0 ? `round-${throughRound}` : "partial";
  const safeExt = (ext || "txt").replace(/^\./, "");
  return `${id}-transcript-${roundPart}.${safeExt}`;
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
