import { useEffect, useState } from "react";
import { createShow } from "../api/client";
import {
  PRESET_AGENTS,
  SHOW_GAMES,
  DEFAULT_SHOW_PROMPT,
  DEFAULT_GM_PROMPT,
  DEFAULT_RULES_TEXT,
  SHOW_TITLE,
} from "../presets";
import { portraitBackgroundStyle } from "../world/portraits";

const CAST_PORTRAIT_SIZE = 48;

const PIXEL_FONT = '"Press Start 2P", "VT323", monospace';
const BODY_FONT = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';

const colors = {
  bg: "#1a1a1e",
  panel: "#16161c",
  elevated: "#2a2a32",
  border: "#3a3a44",
  text: "#e8e8ec",
  muted: "#8a8a96",
  parchment: "#c8c0a8",
  ink: "#111111",
  soft: "#998ba0",
};

const shellStyle = {
  minHeight: "100vh",
  width: "100%",
  margin: 0,
  background: colors.bg,
  color: colors.text,
  fontFamily: BODY_FONT,
  overflow: "auto",
};

const topbarStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 28px",
  borderBottom: `1px solid ${colors.elevated}`,
  background: "linear-gradient(180deg, #14141a, #121218)",
  position: "sticky",
  top: 0,
  zIndex: 2,
};

const brandStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 12,
  color: colors.parchment,
  letterSpacing: "0.04em",
};

const stepStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 8,
  color: colors.muted,
  lineHeight: 1.6,
};

const mainStyle = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "28px 24px 48px",
};

const eyebrowStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 8,
  color: colors.muted,
  letterSpacing: "0.12em",
  marginBottom: 14,
};

const titleStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 16,
  color: colors.text,
  lineHeight: 1.7,
  margin: "0 0 10px",
};

const subtitleStyle = {
  color: colors.muted,
  fontSize: 14,
  margin: "0 0 28px",
  maxWidth: 560,
  lineHeight: 1.5,
};

const gameGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 280px))",
  gap: 16,
  marginBottom: 24,
};

const castGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 14,
  marginBottom: 18,
};

const footerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  borderTop: `1px solid ${colors.elevated}`,
  paddingTop: 18,
  marginTop: 8,
};

const actionsStyle = {
  display: "flex",
  gap: 10,
  justifyContent: "flex-end",
  flexWrap: "wrap",
  borderTop: `1px solid ${colors.elevated}`,
  paddingTop: 18,
  marginTop: 8,
};

const primaryBtnStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 9,
  borderRadius: 4,
  border: `2px solid ${colors.ink}`,
  padding: "12px 16px",
  cursor: "pointer",
  lineHeight: 1.4,
  background: colors.parchment,
  color: colors.ink,
};

const secondaryBtnStyle = {
  ...primaryBtnStyle,
  background: colors.elevated,
  color: colors.text,
  borderColor: colors.border,
};

const counterStyle = {
  fontFamily: PIXEL_FONT,
  fontSize: 8,
  color: colors.parchment,
  marginBottom: 14,
  lineHeight: 1.6,
};

const errorStyle = {
  color: "#e74c3c",
  fontSize: 13,
  margin: "0 0 12px",
};

const roundsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 20,
  flexWrap: "wrap",
};

const roundsLabelStyle = {
  fontSize: 13,
  color: colors.muted,
};

const roundsInputStyle = {
  width: 88,
  background: "#0f0f14",
  border: `1px solid ${colors.border}`,
  borderRadius: 4,
  color: colors.text,
  padding: "8px 10px",
  fontFamily: BODY_FONT,
  fontSize: 14,
};

function gameCardStyle(selected, available, hasCover) {
  return {
    background: colors.panel,
    border: `2px solid ${selected ? colors.parchment : colors.elevated}`,
    borderRadius: 4,
    padding: hasCover ? 0 : 18,
    cursor: available ? "pointer" : "not-allowed",
    minHeight: hasCover ? 280 : 168,
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    opacity: available ? 1 : 0.55,
    boxShadow: selected
      ? "inset 0 0 0 1px rgba(200, 192, 168, 0.35), 0 0 0 1px rgba(200, 192, 168, 0.2)"
      : "none",
    color: colors.text,
    fontFamily: BODY_FONT,
    overflow: "hidden",
    position: "relative",
  };
}

function charCardStyle(selected, accent) {
  return {
    background: colors.panel,
    border: `2px solid ${selected ? accent : colors.elevated}`,
    borderRadius: 4,
    padding: 14,
    minHeight: 260,
    position: "relative",
    cursor: "pointer",
    textAlign: "left",
    color: colors.text,
    fontFamily: BODY_FONT,
    width: "100%",
    boxShadow: selected ? `0 0 0 1px ${accent}66` : "none",
  };
}

export default function ShowSetup({ onCreated }) {
  const [step, setStep] = useState("game");
  const [selectedGameId, setSelectedGameId] = useState("blame");
  const [maxRounds, setMaxRounds] = useState("");
  const [selectedIds, setSelectedIds] = useState(
    () => PRESET_AGENTS.map((agent) => agent.id)
  );
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Live world page needs overflow:hidden on #root; lobby must scroll.
  useEffect(() => {
    const root = document.getElementById("root");
    const prev = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow,
      root: root?.style.overflow ?? "",
    };
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    if (root) root.style.overflow = "auto";
    return () => {
      document.documentElement.style.overflow = prev.html;
      document.body.style.overflow = prev.body;
      if (root) root.style.overflow = prev.root;
    };
  }, []);

  const selectedGame = SHOW_GAMES.find((game) => game.id === selectedGameId);

  function toggleAgent(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id]
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (selectedIds.length !== 5) {
      setError("Select exactly five characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const show = await createShow({
        title: SHOW_TITLE,
        show_prompt: DEFAULT_SHOW_PROMPT,
        gm_prompt: DEFAULT_GM_PROMPT,
        rules_text: DEFAULT_RULES_TEXT,
        max_rounds: maxRounds === "" ? null : Number(maxRounds),
        agent_preset_ids: selectedIds,
      });
      onCreated(show);
    } catch (err) {
      setError(err.message || "Failed to start show");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={shellStyle} data-testid="show-setup">
      <header style={topbarStyle}>
        <div style={brandStyle} data-testid="show-title">{SHOW_TITLE}</div>
        <div style={stepStyle}>
          STEP <span style={{ color: colors.parchment }}>{step === "game" ? "1" : "2"}</span> / 2
          {step === "cast" && selectedGame ? (
            <span style={{ color: colors.soft }}> · {selectedGame.title}</span>
          ) : null}
        </div>
      </header>

      <main style={mainStyle}>
        {step === "game" ? (
          <section data-testid="game-pick-step">
            <div style={eyebrowStyle}>PRODUCER LOBBY</div>
            <h1 style={titleStyle}>Choose the show</h1>
            <p style={subtitleStyle}>
              Pick a premise. Next you&apos;ll cast five players for the house.
            </p>

            <div style={gameGridStyle} role="listbox" aria-label="Available shows">
              {SHOW_GAMES.map((game) => {
                const selected = game.id === selectedGameId;
                const hasCover = Boolean(game.coverImage);
                return (
                  <button
                    key={game.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-disabled={!game.available}
                    disabled={!game.available}
                    data-testid={`game-card-${game.id}`}
                    onClick={() => game.available && setSelectedGameId(game.id)}
                    style={gameCardStyle(selected, game.available, hasCover)}
                  >
                    {hasCover ? (
                      <>
                        <img
                          src={game.coverImage}
                          alt=""
                          data-testid={`game-cover-${game.id}`}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            // Keep the orange spotlight / body near the visual center.
                            objectPosition: "center 42%",
                            display: "block",
                          }}
                        />
                        <div
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(180deg, rgba(12,12,16,0.55) 0%, rgba(12,12,16,0.05) 38%, rgba(12,12,16,0.2) 55%, rgba(12,12,16,0.92) 100%)",
                          }}
                        />
                        <div
                          style={{
                            position: "relative",
                            zIndex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "flex-end",
                            minHeight: 280,
                            padding: "14px 14px 16px",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: PIXEL_FONT,
                              fontSize: 7,
                              color: colors.parchment,
                              marginBottom: 10,
                              lineHeight: 1.6,
                              textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                            }}
                          >
                            {game.tag}
                          </div>
                          <div
                            style={{
                              fontFamily: PIXEL_FONT,
                              fontSize: 12,
                              lineHeight: 1.55,
                              marginBottom: 10,
                              color: colors.text,
                              textShadow: "0 1px 3px rgba(0,0,0,0.85)",
                            }}
                          >
                            {game.title}
                          </div>
                          <div
                            style={{
                              color: "#c8c8d0",
                              fontSize: 13,
                              lineHeight: 1.45,
                              marginBottom: 12,
                            }}
                          >
                            {game.blurb}
                          </div>
                          <div style={{ fontSize: 12, color: colors.soft }}>
                            {game.meta}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            fontFamily: PIXEL_FONT,
                            fontSize: 7,
                            color: colors.parchment,
                            marginBottom: 12,
                            lineHeight: 1.6,
                          }}
                        >
                          {game.tag}
                        </div>
                        <div
                          style={{
                            fontFamily: PIXEL_FONT,
                            fontSize: 11,
                            lineHeight: 1.6,
                            marginBottom: 10,
                          }}
                        >
                          {game.title}
                        </div>
                        <div
                          style={{
                            color: colors.muted,
                            fontSize: 13,
                            lineHeight: 1.45,
                            flex: 1,
                          }}
                        >
                          {game.blurb}
                        </div>
                        <div
                          style={{
                            marginTop: 14,
                            fontSize: 12,
                            color: colors.soft,
                          }}
                        >
                          {game.meta}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={footerStyle}>
              <div style={{ fontSize: 12, color: colors.muted }}>
                {selectedGame?.available ? "1 show selected" : "Select an available show"}
              </div>
              <button
                type="button"
                style={{
                  ...primaryBtnStyle,
                  opacity: selectedGame?.available ? 1 : 0.4,
                  cursor: selectedGame?.available ? "pointer" : "not-allowed",
                }}
                disabled={!selectedGame?.available}
                onClick={() => setStep("cast")}
              >
                Continue → Cast
              </button>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmit} data-testid="cast-pick-step">
            <div style={eyebrowStyle}>CASTING</div>
            <h1 style={titleStyle}>Pick your five</h1>
            <p style={subtitleStyle}>
              Exactly five enter the house. Each card lists the traits that drive how they scheme.
            </p>

            <div style={counterStyle}>
              SELECTED {selectedIds.length} / 5
            </div>

            <div style={roundsRowStyle}>
              <label htmlFor="max-rounds" style={roundsLabelStyle}>
                Number of rounds (blank for unlimited)
              </label>
              <input
                id="max-rounds"
                type="number"
                min="1"
                value={maxRounds}
                onChange={(e) => setMaxRounds(e.target.value)}
                style={roundsInputStyle}
              />
            </div>

            <div style={castGridStyle}>
              {PRESET_AGENTS.map((agent, index) => {
                const selected = selectedIds.includes(agent.id);
                const spriteKey = `slot-${index + 1}`;
                return (
                  <button
                    key={agent.id}
                    type="button"
                    aria-pressed={selected}
                    aria-label={agent.name}
                    data-testid={`agent-card-${agent.id}`}
                    onClick={() => toggleAgent(agent.id)}
                    style={charCardStyle(selected, agent.accent)}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 18,
                        height: 18,
                        border: `2px solid ${selected ? colors.ink : colors.border}`,
                        borderRadius: 3,
                        background: selected ? colors.parchment : "#0f0f14",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {selected ? (
                        <span
                          style={{
                            width: 5,
                            height: 9,
                            border: `solid ${colors.ink}`,
                            borderWidth: "0 2px 2px 0",
                            transform: "rotate(45deg) translate(-1px, -1px)",
                          }}
                        />
                      ) : null}
                    </span>

                    <div
                      data-testid={`cast-portrait-${agent.id}`}
                      aria-hidden="true"
                      style={{
                        width: CAST_PORTRAIT_SIZE,
                        height: CAST_PORTRAIT_SIZE,
                        borderRadius: 4,
                        border: `2px solid ${agent.accent}`,
                        backgroundColor: "#0c0c10",
                        marginBottom: 12,
                        ...portraitBackgroundStyle(spriteKey, CAST_PORTRAIT_SIZE),
                      }}
                    />

                    <div
                      style={{
                        fontFamily: PIXEL_FONT,
                        fontSize: 7,
                        color: agent.accent,
                        marginBottom: 8,
                        letterSpacing: "0.04em",
                        lineHeight: 1.6,
                      }}
                    >
                      {agent.role.toUpperCase()}
                    </div>

                    <div
                      style={{
                        fontFamily: PIXEL_FONT,
                        fontSize: 10,
                        lineHeight: 1.55,
                        marginBottom: 8,
                      }}
                    >
                      {agent.displayName}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: colors.muted,
                        lineHeight: 1.4,
                        marginBottom: 12,
                      }}
                    >
                      {agent.summary}
                    </div>

                    <ul
                      style={{
                        margin: 0,
                        padding: "0 0 0 16px",
                        color: colors.text,
                        fontSize: 12,
                        lineHeight: 1.45,
                      }}
                    >
                      {agent.traits.map((trait) => (
                        <li
                          key={trait}
                          style={{ marginBottom: 4, color: colors.soft }}
                        >
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {error && (
              <p role="alert" style={errorStyle}>
                {error}
              </p>
            )}

            <div style={actionsStyle}>
              <button
                type="button"
                style={secondaryBtnStyle}
                onClick={() => {
                  setError(null);
                  setStep("game");
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                style={{
                  ...primaryBtnStyle,
                  opacity: selectedIds.length === 5 && !submitting ? 1 : 0.4,
                  cursor:
                    selectedIds.length === 5 && !submitting
                      ? "pointer"
                      : "not-allowed",
                }}
                disabled={selectedIds.length !== 5 || submitting}
              >
                {submitting ? "Starting…" : "Start show"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
