import { useMemo, useState } from "react";
import WorldView from "../components/WorldView";
import RoundEndModal from "../components/RoundEndModal";
import TranscriptModal from "../components/TranscriptModal";
import { getShow, startRound, endShow } from "../api/client";

const PIXEL_FONT = '"Press Start 2P", "VT323", monospace';
const BODY_FONT = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';

const SPAWN_POSITIONS = [
  { tileX: 3, tileY: 3 },
  { tileX: 16, tileY: 3 },
  { tileX: 10, tileY: 3 },
  { tileX: 3, tileY: 12 },
  { tileX: 16, tileY: 12 },
];

export function buildCharacters(show) {
  return show.contestants.map((contestant, index) => ({
    id: contestant.id,
    name: contestant.name,
    spriteKey: `slot-${index + 1}`,
    ...SPAWN_POSITIONS[index],
  }));
}

function isRoundLimitError(error) {
  return /round limit/i.test(error?.message || "");
}

const pageStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  background: "#1a1a1e",
  fontFamily: BODY_FONT,
};

const chromeStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  padding: "10px 16px",
  flexShrink: 0,
  background: "linear-gradient(180deg, #14141a, #121218)",
  borderBottom: "1px solid #2a2a32",
  zIndex: 4,
};

const brandStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 11,
  color: "#c8c0a8",
  letterSpacing: "0.04em",
  lineHeight: 1.5,
  marginRight: 4,
};

const statusStyle = {
  flex: "1 1 140px",
  fontSize: 13,
  color: "#8a8a96",
  minWidth: 120,
};

const actionsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginLeft: "auto",
};

const primaryButtonStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 8,
  lineHeight: 1.4,
  borderRadius: 4,
  border: "2px solid #111111",
  background: "#c8c0a8",
  color: "#111111",
  padding: "10px 12px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: "#2a2a32",
  color: "#e8e8ec",
  borderColor: "#3a3a44",
};

const errorStyle = {
  flexShrink: 0,
  margin: 0,
  padding: "8px 16px",
  color: "#8c4456",
  background: "#fff2f5",
  borderBottom: "1px solid #e5b7c4",
  fontSize: 13,
};

const stageStyle = {
  flex: "1 1 0",
  minHeight: 0,
  position: "relative",
};

function producerStatus({ roundActive, modalOpen, showOver, endedRound, starting }) {
  if (showOver) return "Show over";
  if (starting || roundActive) return "Round live…";
  if (modalOpen && endedRound) return `Round ${endedRound.round} ended`;
  if (endedRound) return `Round ${endedRound.round} complete · Ready`;
  return "Round idle · Ready to start";
}

export default function WorldPage({ show, onEndGame = () => {} }) {
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [roundActive, setRoundActive] = useState(false);
  const [endedRound, setEndedRound] = useState(null);
  const [narratives, setNarratives] = useState(() => ({ ...(show.narratives || {}) }));
  const [storyOpen, setStoryOpen] = useState(false);
  const [showOver, setShowOver] = useState(show.status === "ended");
  const [startError, setStartError] = useState(null);
  const [dialogueBusy, setDialogueBusy] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  const characters = useMemo(() => buildCharacters(show), [show]);

  // Wait for in-world bubbles / pending dialogue to finish before showing the modal.
  const modalOpen = endedRound != null && !roundActive && !dialogueBusy;
  const transcriptAvailable = endedRound != null || showOver;
  const canStartRound = !roundActive && !modalOpen && !starting && !showOver;
  const status = producerStatus({
    roundActive,
    modalOpen,
    showOver,
    endedRound,
    starting,
  });

  async function runRound(openingBrief = "") {
    const previousEnded = endedRound;
    setStarting(true);
    setStartError(null);
    setStoryOpen(false);
    setRoundActive(true);
    setEndedRound(null);
    try {
      const trimmed = typeof openingBrief === "string" ? openingBrief.trim() : "";
      const result = await startRound(
        show.id,
        trimmed ? { opening_brief: trimmed } : {},
      );
      setNarratives((prev) => ({
        ...prev,
        [result.round]: result.narrative,
      }));
      setEndedRound({
        round: result.round,
        recap: result.recap || result.narrative,
        narrative: result.narrative,
      });
      if (show.max_rounds != null && result.round >= show.max_rounds) {
        setShowOver(true);
      }
    } catch (error) {
      if (isRoundLimitError(error)) {
        setShowOver(true);
        setEndedRound((prev) => {
          if (prev) return prev;
          if (previousEnded) return previousEnded;
          const rounds = Object.keys(narratives).map(Number);
          if (rounds.length === 0) return null;
          const last = Math.max(...rounds);
          return {
            round: last,
            recap: narratives[last],
            narrative: narratives[last],
          };
        });
      } else {
        setStartError(error.message || "Failed to start round");
      }
    } finally {
      setStarting(false);
      setRoundActive(false);
    }
  }

  async function handleToggleStory() {
    const next = !storyOpen;
    setStoryOpen(next);
    if (next) {
      try {
        const fresh = await getShow(show.id);
        if (fresh.narratives) {
          setNarratives((prev) => ({ ...prev, ...fresh.narratives }));
        }
      } catch {
        // Keep local narratives if refresh fails.
      }
    }
  }

  async function handleEndGame() {
    setEnding(true);
    setStartError(null);
    try {
      await endShow(show.id);
      onEndGame();
    } catch (error) {
      setStartError(error.message || "Failed to end game");
    } finally {
      setEnding(false);
    }
  }

  async function handleOpenTranscript() {
    if (!transcriptAvailable || transcriptLoading) return;
    setTranscriptLoading(true);
    setStartError(null);
    try {
      const fresh = await getShow(show.id);
      setTranscriptData(fresh);
      setTranscriptOpen(true);
    } catch (error) {
      setStartError(error.message || "Failed to load transcript");
    } finally {
      setTranscriptLoading(false);
    }
  }

  return (
    <div style={pageStyle} data-testid="world-page">
      <header style={chromeStyle} data-testid="producer-chrome">
        <div style={brandStyle}>{show.title || "Bhram"}</div>
        <div style={statusStyle} data-testid="producer-status">
          {status}
        </div>
        <div style={actionsStyle}>
          {/* Hide while round-end modal owns next-round / show-over actions. */}
          {(canStartRound || (showOver && !modalOpen)) ? (
            <button
              type="button"
              onClick={() => runRound()}
              disabled={!canStartRound}
              style={{
                ...primaryButtonStyle,
                opacity: canStartRound ? 1 : 0.55,
                cursor: canStartRound ? "pointer" : "not-allowed",
              }}
            >
              {showOver ? "Show over" : "Start round"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleOpenTranscript}
            disabled={!transcriptAvailable || transcriptLoading}
            style={{
              ...secondaryButtonStyle,
              opacity: !transcriptAvailable || transcriptLoading ? 0.55 : 1,
              cursor:
                !transcriptAvailable || transcriptLoading ? "not-allowed" : "pointer",
            }}
          >
            {transcriptLoading ? "Loading…" : "Transcript"}
          </button>
        </div>
      </header>

      {startError && (
        <p role="alert" style={errorStyle}>
          {startError}
        </p>
      )}

      <div style={stageStyle}>
        <WorldView
          showId={show.id}
          characters={characters}
          onDialogueBusyChange={setDialogueBusy}
        />
      </div>

      {modalOpen && (
        <RoundEndModal
          round={endedRound.round}
          recap={endedRound.recap}
          narratives={narratives}
          storyOpen={storyOpen}
          showOver={showOver}
          starting={starting}
          ending={ending}
          onStartNext={runRound}
          onToggleStory={handleToggleStory}
          onEndGame={handleEndGame}
        />
      )}
      {transcriptOpen && transcriptData && (
        <TranscriptModal
          showData={transcriptData}
          onClose={() => setTranscriptOpen(false)}
        />
      )}
    </div>
  );
}
