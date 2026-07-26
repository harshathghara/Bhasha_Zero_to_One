import { useMemo, useRef, useState } from "react";
import {
  DIRECTIONS,
  FRAMES_PER_DIRECTION,
  SPRITE_SOURCE_SIZE,
} from "../world/sprites";
import { speechKindFromEvent, speechLabelFromEvent } from "../world/speechStyles";
import {
  buildCastEntries,
  buildTranscriptText,
  downloadTextFile,
  transcriptFilename,
} from "../transcript";
import { downloadTranscriptPdf } from "../transcriptPdf";

const PIXEL_FONT = '"Press Start 2P", "VT323", monospace';
const BODY_FONT = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';
const PORTRAIT_SIZE = 32;

const overlayStyle = {
  position: "absolute",
  inset: 0,
  zIndex: 5,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0, 0, 0, 0.45)",
  padding: "24px",
  boxSizing: "border-box",
};

const panelStyle = {
  width: "min(920px, 88vw)",
  height: "min(820px, 85vh)",
  display: "flex",
  flexDirection: "column",
  background: "#16161c",
  border: "1px solid #3a3a44",
  borderRadius: "8px",
  boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
  color: "#e8e8ec",
  fontFamily: BODY_FONT,
  overflow: "hidden",
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  padding: "14px 16px",
  borderBottom: "1px solid #2a2a32",
  flexShrink: 0,
};

const titleStyle = {
  margin: 0,
  fontFamily: PIXEL_FONT,
  fontSize: "10px",
  lineHeight: 1.6,
  color: "#c8c0a8",
  letterSpacing: "0.04em",
};

const subtitleStyle = {
  margin: "6px 0 0",
  fontSize: "12px",
  color: "#8a8a96",
};

const actionsStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  flexShrink: 0,
};

const buttonStyle = {
  border: "1px solid #3a3a44",
  borderRadius: "4px",
  background: "#2a2a32",
  color: "#e8e8ec",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: 700,
  cursor: "pointer",
};

const downloadButtonStyle = {
  ...buttonStyle,
  background: "#c8c0a8",
  color: "#111111",
  borderColor: "#c8c0a8",
};

const bodyStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  padding: "16px",
};

const sectionLabelStyle = {
  margin: "0 0 10px",
  fontFamily: PIXEL_FONT,
  fontSize: "8px",
  color: "#8a8a96",
  letterSpacing: "0.08em",
};

const castRowStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "flex-start",
  marginBottom: "10px",
  padding: "8px 10px",
  background: "#1a1a22",
  borderRadius: "6px",
};

const roundHeadingStyle = {
  margin: "18px 0 12px",
  fontFamily: PIXEL_FONT,
  fontSize: "9px",
  color: "#c99b52",
  letterSpacing: "0.04em",
};

const lineRowStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "flex-start",
  marginBottom: "14px",
};

const metaStyle = {
  fontSize: "11px",
  color: "#8a8a96",
  marginBottom: "3px",
};

const textStyle = {
  margin: 0,
  fontSize: "13px",
  lineHeight: 1.5,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};

function characterAssetUrl(spriteKey) {
  return new URL(`../world/assets/char-${spriteKey}.png`, import.meta.url).href;
}

function portraitStyle(spriteUrl, accent) {
  const sheetW = FRAMES_PER_DIRECTION * SPRITE_SOURCE_SIZE;
  const sheetH = DIRECTIONS.length * SPRITE_SOURCE_SIZE;
  const scale = PORTRAIT_SIZE / SPRITE_SOURCE_SIZE;
  return {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    flexShrink: 0,
    borderRadius: "4px",
    border: `1px solid ${accent || "#3a3a44"}`,
    backgroundColor: "#0c0c10",
    backgroundImage: `url(${spriteUrl})`,
    backgroundSize: `${sheetW * scale}px ${sheetH * scale}px`,
    backgroundPosition: "0 0",
    backgroundRepeat: "no-repeat",
    imageRendering: "pixelated",
  };
}

function badgePortrait(label, background) {
  return {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    flexShrink: 0,
    borderRadius: "4px",
    border: "1px solid #3a3a44",
    background,
    color: "#111111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: 700,
  };
}

function senderName(senderId, charactersById) {
  if (!senderId) return "Unknown";
  if (senderId === "game_master") return "Game Master";
  if (senderId === "narrator") return "Narrator";
  if (senderId === "producer") return "Producer";
  return charactersById.get(senderId)?.name || senderId;
}

function PortraitForSender({ senderId, castById, line = false }) {
  const testId = line
    ? `transcript-line-portrait-${senderId || "unknown"}`
    : `transcript-portrait-${senderId || "unknown"}`;

  if (senderId === "game_master") {
    return (
      <div data-testid={line ? "transcript-line-portrait-gm" : "transcript-portrait-gm"} style={badgePortrait("GM", "#c99b52")}>
        GM
      </div>
    );
  }

  const member = castById.get(senderId);
  if (!member) {
    const label = senderId === "producer" ? "PR" : senderId === "narrator" ? "NR" : "?";
    const bg = senderId === "producer" ? "#e74c3c" : "#94a3b8";
    return (
      <div data-testid={testId} style={badgePortrait(label, bg)}>
        {label}
      </div>
    );
  }

  return (
    <div
      data-testid={line ? `transcript-line-portrait-${member.id}` : `transcript-portrait-${member.id}`}
      style={portraitStyle(characterAssetUrl(member.spriteKey), member.accent)}
      aria-hidden
    />
  );
}

function LeakPortrait() {
  return (
    <div data-testid="transcript-line-portrait-leak" style={badgePortrait("LK", "#c0392b")}>
      LK
    </div>
  );
}

export default function TranscriptModal({ showData, onClose }) {
  const captureRef = useRef(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const cast = useMemo(
    () => buildCastEntries(showData?.contestants || []),
    [showData?.contestants],
  );
  const castById = useMemo(() => new Map(cast.map((c) => [c.id, c])), [cast]);
  const charactersById = useMemo(
    () => new Map((showData?.contestants || []).map((c) => [c.id, c])),
    [showData?.contestants],
  );

  const rounds = useMemo(() => {
    const keys = new Set();
    for (const event of showData?.events || []) {
      if (event.round != null) keys.add(Number(event.round));
    }
    for (const key of Object.keys(showData?.recaps || {})) keys.add(Number(key));
    for (const key of Object.keys(showData?.narratives || {})) keys.add(Number(key));
    return [...keys].filter((n) => !Number.isNaN(n)).sort((a, b) => a - b);
  }, [showData?.events, showData?.recaps, showData?.narratives]);

  const throughRound = rounds.length ? Math.max(...rounds) : 0;

  function handleDownloadTxt() {
    const text = buildTranscriptText({
      title: showData?.title,
      contestants: showData?.contestants || [],
      events: showData?.events || [],
      recaps: showData?.recaps || {},
      narratives: showData?.narratives || {},
    });
    downloadTextFile(transcriptFilename(showData?.id, throughRound, "txt"), text);
  }

  async function handleDownloadPdf() {
    if (pdfBusy || !captureRef.current) return;
    setPdfBusy(true);
    setPdfError(null);
    try {
      await downloadTranscriptPdf(
        captureRef.current,
        transcriptFilename(showData?.id, throughRound, "pdf"),
      );
    } catch (error) {
      setPdfError(error?.message || "Failed to export PDF");
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div
      data-testid="transcript-modal"
      style={overlayStyle}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div style={panelStyle} role="dialog" aria-labelledby="transcript-title">
        <div style={headerStyle}>
          <div>
            <h2 id="transcript-title" style={titleStyle}>
              PRODUCER LOG
            </h2>
            <p style={subtitleStyle}>
              Full producer cut
              {throughRound ? ` · through Round ${throughRound}` : ""}
            </p>
            {pdfError && (
              <p role="alert" style={{ ...subtitleStyle, color: "#e74c3c" }}>
                {pdfError}
              </p>
            )}
          </div>
          <div style={actionsStyle}>
            <button type="button" style={buttonStyle} onClick={handleDownloadTxt}>
              Download .txt
            </button>
            <button
              type="button"
              style={{
                ...downloadButtonStyle,
                opacity: pdfBusy ? 0.65 : 1,
              }}
              onClick={handleDownloadPdf}
              disabled={pdfBusy}
            >
              {pdfBusy ? "Exporting…" : "Download PDF"}
            </button>
            <button type="button" style={buttonStyle} onClick={onClose} aria-label="Close">
              Close
            </button>
          </div>
        </div>

        <div data-testid="transcript-scroll" style={bodyStyle}>
          <div
            ref={captureRef}
            data-testid="transcript-capture"
            style={{ background: "#16161c", color: "#e8e8ec", padding: "4px 2px 8px" }}
          >
          <div style={{ marginBottom: 14 }}>
            <div style={titleStyle}>PRODUCER LOG</div>
            <p style={subtitleStyle}>
              Full producer cut
              {throughRound ? ` · through Round ${throughRound}` : ""}
            </p>
          </div>
          <p style={sectionLabelStyle}>CAST · TRAITS</p>
          {cast.map((member) => (
            <div
              key={member.id}
              style={{ ...castRowStyle, borderLeft: `3px solid ${member.accent}` }}
            >
              <PortraitForSender senderId={member.id} castById={castById} />
              <div>
                <div style={{ color: member.accent, fontWeight: 700, fontSize: "13px" }}>
                  {member.name}
                </div>
                <ul
                  style={{
                    margin: "6px 0 0",
                    padding: "0 0 0 16px",
                    color: "#8a8a96",
                    fontSize: "12px",
                    lineHeight: 1.45,
                  }}
                >
                  {member.traits.map((trait) => (
                    <li key={trait} style={{ marginBottom: 2 }}>
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {rounds.map((round) => {
            const events = (showData?.events || [])
              .filter((event) => Number(event.round) === round)
              .sort((a, b) => (a.seq ?? 0) - (b.seq ?? 0));
            const recap = showData?.recaps?.[round] ?? showData?.recaps?.[String(round)];
            const story = showData?.narratives?.[round] ?? showData?.narratives?.[String(round)];
            return (
              <section key={round}>
                <h3 style={roundHeadingStyle}>▸ ROUND {round}</h3>
                {events.map((event) => {
                  const kind = speechKindFromEvent(event);
                  const recipients = (event.recipients || [])
                    .map((id) => senderName(id, charactersById))
                    .filter(Boolean);
                  const isLeak = kind === "leak";
                  return (
                    <div key={event.seq ?? `${round}-${event.text}`} style={lineRowStyle}>
                      {isLeak ? (
                        <LeakPortrait />
                      ) : (
                        <PortraitForSender
                          senderId={event.sender_id}
                          castById={castById}
                          line
                        />
                      )}
                      <div>
                        <div style={{ ...metaStyle, color: isLeak ? "#e74c3c" : "#8a8a96" }}>
                          {senderName(event.sender_id, charactersById)}
                          {" · "}
                          {speechLabelFromEvent(event)}
                          {recipients.length ? ` → ${recipients.join(", ")}` : ""}
                        </div>
                        <p style={{ ...textStyle, color: isLeak ? "#e74c3c" : "#e8e8ec" }}>
                          {event.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {recap && (
                  <>
                    <h3 style={roundHeadingStyle}>▸ ROUND {round} RECAP</h3>
                    <p style={{ ...textStyle, marginBottom: 12 }}>{recap}</p>
                  </>
                )}
                {story && (
                  <>
                    <h3 style={roundHeadingStyle}>▸ ROUND {round} STORY</h3>
                    <p style={{ ...textStyle, marginBottom: 12 }}>{story}</p>
                  </>
                )}
              </section>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
