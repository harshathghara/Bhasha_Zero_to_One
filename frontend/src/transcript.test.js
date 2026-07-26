import { describe, it, expect } from "vitest";
import {
  buildCastEntries,
  formatEventLine,
  buildTranscriptText,
  transcriptFilename,
} from "./transcript";

const contestants = [
  { id: "creditor", name: "Vikram Sethi — The Creditor" },
  { id: "wife", name: "Priya Malhotra — The Wife" },
  { id: "lawyer", name: "Arjun Mehta — The Lawyer" },
  { id: "brother", name: "Karan Malhotra — The Brother" },
  { id: "househelp", name: "Meena Devi — The Househelp" },
];

describe("buildCastEntries", () => {
  it("attaches spriteKey, accent, role, and traits for each contestant", () => {
    const cast = buildCastEntries(contestants);
    expect(cast).toHaveLength(5);
    expect(cast[0]).toMatchObject({
      id: "creditor",
      name: "Vikram Sethi — The Creditor",
      displayName: "Vikram Sethi",
      role: "The Creditor",
      spriteKey: "slot-1",
      accent: "#eab879",
    });
    expect(cast[0].traits.length).toBeGreaterThan(0);
    expect(cast[4].spriteKey).toBe("slot-5");
    expect(cast[4].traits.some((t) => /gossip|leaks/i.test(t))).toBe(true);
  });
});

describe("formatEventLine", () => {
  const byId = new Map(contestants.map((c) => [c.id, c]));

  it("formats private lines with recipients", () => {
    const line = formatEventLine(
      {
        sender_id: "creditor",
        kind: "agent_action",
        visibility: "private",
        recipients: ["wife"],
        text: "Protect me on the debt.",
        timestamp: 0,
      },
      byId,
    );
    expect(line).toContain("Vikram Sethi — The Creditor");
    expect(line).toMatch(/PRIVATE/i);
    expect(line).toContain("Priya Malhotra — The Wife");
    expect(line).toContain("Protect me on the debt.");
  });

  it("labels GM and leak kinds", () => {
    expect(
      formatEventLine(
        { sender_id: "game_master", kind: "gm_announcement", text: "Doors sealed.", timestamp: 0 },
        byId,
      ),
    ).toMatch(/Game Master/i);
    expect(
      formatEventLine(
        { sender_id: "producer", kind: "leak", text: "Leaked whisper.", timestamp: 0 },
        byId,
      ),
    ).toMatch(/LEAK/i);
  });
});

describe("buildTranscriptText", () => {
  it("includes cast traits, round events, and recap/story", () => {
    const text = buildTranscriptText({
      title: "Bhram",
      contestants,
      events: [
        {
          round: 1,
          seq: 1,
          sender_id: "game_master",
          kind: "gm_announcement",
          visibility: "public",
          recipients: [],
          text: "Doors sealed.",
          timestamp: 1000,
        },
        {
          round: 1,
          seq: 2,
          sender_id: "creditor",
          kind: "agent_action",
          visibility: "private",
          recipients: ["wife"],
          text: "Protect me.",
          timestamp: 1001,
        },
      ],
      recaps: { 1: "Heat shifted onto Karan." },
      narratives: { 1: "Priya watched the room turn." },
    });

    expect(text).toMatch(/PRODUCER LOG/i);
    expect(text).toContain("Vikram Sethi — The Creditor");
    expect(text).toMatch(/Cold & calculating/i);
    expect(text).toContain("ROUND 1");
    expect(text).toContain("Doors sealed.");
    expect(text).toContain("Protect me.");
    expect(text).toContain("Heat shifted onto Karan.");
    expect(text).toContain("Priya watched the room turn.");
  });
});

describe("transcriptFilename", () => {
  it("uses a .txt extension by default and supports .pdf", () => {
    expect(transcriptFilename("bhram", 2)).toBe("bhram-transcript-round-2.txt");
    expect(transcriptFilename("bhram", 2, "pdf")).toBe("bhram-transcript-round-2.pdf");
  });
});
