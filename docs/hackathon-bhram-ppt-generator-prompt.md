# Bhram — Hackathon PPT Generator Prompt

Copy everything inside the box below into Gamma, Beautiful.ai, Plus AI, Copilot, ChatGPT, Claude, or any other slide generator.

---

## PASTE THIS PROMPT

```
Create a hackathon pitch deck for the project below.

═══════════════════════════════════════
HARD CONSTRAINTS
═══════════════════════════════════════
- Exactly 10 slides. No more, no less.
- Product / hackathon-first narrative: problem → solution → how it works → story as proof → tech → why we win.
- Use the murder-blame story ("Bhram: Who Takes the Blame?") as the concrete demo proof — not as abstract sci-fi fluff.
- Judges should understand the product in under 5 minutes of presenting.
- One idea per slide. Max 5–7 short bullets or one clear visual diagram per slide.
- No walls of text. Prefer short punchy lines a presenter can speak over.
- Include suggested speaker notes (2–4 sentences) for each slide.
- Include a suggested visual/layout note for each slide (what graphic to show).

═══════════════════════════════════════
VISUAL DIRECTION
═══════════════════════════════════════
- Theme: dark, cinematic, reality-TV tension — not generic purple SaaS.
- Palette suggestion: deep charcoal / near-black backgrounds, warm amber or crimson accent, clean white text, muted gold for "leak / secret" moments.
- Typography: bold display titles + clean sans body. Avoid Inter/Roboto/Arial if the tool allows alternatives.
- Mood: Bigg Boss × Knives Out × AI agents.
- Avoid: cluttered dashboards, emoji spam, neon glow overload, stock "handshake" photos.
- Where useful, use simple diagrams (house of 5 agents, public vs private vs leak flow).

═══════════════════════════════════════
PROJECT FACTS (SOURCE OF TRUTH — DO NOT INVENT FEATURES)
═══════════════════════════════════════
Project name: Bhram
Tagline / show title: "Bhram: Who Takes the Blame?"
One-liner: An AI reality-show simulation where five LLM-driven characters are locked in a house with one dead man and one killer among them — they talk, scheme, betray, and pin the blame, while a human "producer" watches live and can leak secrets mid-game.

Core loop:
1. Five contestant agents (LLMs) with distinct personalities and motives.
2. Tools: speak publicly, send private messages, confess (audience/GM only), leak something they witnessed, or stay silent.
3. A separate Game Master LLM enforces house rules, nudges stalled talk, and ends a round only when the house clearly piles onto one name.
4. A narrator writes a short producer recap + longer story chapter after each round.
5. Human producer watches a live 2D world + chat feed over WebSocket, and can inject notes or leak a private secret to the whole house.
6. Event-sourced: every speech, DM, confession, leak, and ruling is an Event on a per-show log.

Default story premise:
- Victim: Ramesh Malhotra (middle-class man), found dead in the house. Police have not taken over.
- Exactly one of the five is the killer. Nobody knows who — not even encoded in the system. There is no "correct answer" stored anywhere.
- Ambiguous clues (none prove guilt alone):
  1) Loud argument near midnight — two voices; one was Ramesh, the other unclear.
  2) A cash bundle Ramesh kept is missing.
  3) A glass smashed in the hallway; no one admits who broke it.
- Goal of the house: converge on ONE of the five who "takes the blame for now" — they may or may not be the real murderer.

Cast (exactly five):
1. Vikram Sethi — The Creditor: cold, calculating; Ramesh owed him dangerous money; weaponizes the missing cash.
2. Priya Malhotra — The Wife: image-obsessed grieving widow publicly; charming and restless privately; steers blame to "dangerous people" in the room.
3. Arjun Mehta — The Lawyer: precise friend/advisor; builds tidy narratives that exonerate him while sounding fair.
4. Karan Malhotra — The Brother: younger brother, jealous, impulsive; loud accusations; flips when scared.
5. Meena Devi — The Househelp: underestimated gossip engine; drops half-true crumbs; when a secret is publicly leaked, she names who it exposes and quotes the juiciest line.

Signature twist — Leaking:
- Private messages and confessions can be revealed to the whole house.
- Triggered by the human producer ("Leak" in UI) OR by an agent that witnessed the secret.
- Once leaked, it becomes common knowledge; characters (especially Meena) react by name.

Tech (keep brief on the tech slide):
- Backend: FastAPI, event bus, agent loops, GM loop, round supervisor, narrator, OpenAI/Groq LLM.
- Frontend: React + Vite, live 2D world view, chat sidebar with filters, Leak button, round-end story modal.
- Live sync: WebSocket event stream.

What makes this hackathon-worthy:
- Multi-agent emergent drama (not a chatbot FAQ).
- Visibility model (public / private / confession / leak) creates real information asymmetry.
- Human-in-the-loop "producer" can reshape the story live.
- Story quality is first-class (recap + narrative chapter), not an afterthought.
- Configurable show premise/cast — murder-blame is the flagship demo pack.

Do NOT claim: persistent multi-tenant cloud product, auth, mobile app, or that the system knows who the killer is.

═══════════════════════════════════════
SLIDE-BY-SLIDE BRIEF (FOLLOW THIS ORDER)
═══════════════════════════════════════

SLIDE 1 — Title
- Big title: BHRAM
- Subtitle: Who Takes the Blame?
- One line under that: "An AI reality show where agents scheme, betray, and pin a murder — live."
- Small footer: Hackathon Demo / [Your Team Name]
- Visual: cinematic title card — empty house silhouette or five silhouettes around a body outline; amber accent. No dense UI screenshot yet.
- Speaker note: Introduce the name and the hook in one breath: AI agents in a murder-blame reality show, with a human producer who can leak secrets.

SLIDE 2 — The Problem
- Headline: AI can chat. It still can't put on a show.
- Bullets:
  - Most multi-agent demos are polite roundtables or tool callers.
  - No real secrets, no betrayal cost, no audience tension.
  - Story collapses into bland consensus or endless looping talk.
  - Creators/producers can't intervene like they do in real reality TV.
- Visual: simple "flat chatbot vs. messy drama" contrast (two columns).
- Speaker note: Judges have seen agent demos. The gap is emergent drama with asymmetric information and a human director.

SLIDE 3 — The Solution
- Headline: Bhram — a live AI reality-show engine
- Bullets / cards:
  - 5 LLM contestants with motives, not scripts
  - Game Master that enforces rules (doesn't know the killer)
  - Producer watches live and can leak secrets mid-round
  - Narrator turns each round into a story chapter
- One-liner callout: "Same house. Different secrets. Every run is a new episode."
- Visual: product diagram — Cast ↔ Event Bus ↔ GM / Narrator / Producer UI
- Speaker note: Position Bhram as a simulation + storytelling engine, not "five chatbots in a group chat."

SLIDE 4 — How It Works
- Headline: One house. Four channels of truth.
- Show a clear 2×2 or flow:
  1. PUBLIC — everyone hears
  2. PRIVATE — only two agents (until leaked)
  3. CONFESSION — audience + GM only
  4. LEAK — private becomes public, house reacts
- Tiny caption: Event-sourced live log streamed over WebSocket to a 2D world + chat UI.
- Visual: channel diagram with a "LEAK" arrow turning a private bubble into a house-wide announcement.
- Speaker note: This visibility model is the product. Drama comes from who knows what, and when it explodes.

SLIDE 5 — The Story Premise (demo proof starts)
- Headline: Tonight's episode: Who Takes the Blame?
- Setup lines:
  - Ramesh Malhotra is dead in the house.
  - Police aren't here yet.
  - Exactly one of the five did it — and nobody knows who (including the AI system).
- Three clue chips:
  - Midnight argument (second voice unclear)
  - Missing cash bundle
  - Smashed glass in the hallway
- Tagline at bottom: "The house must put the blame on ONE of the five — for now."
- Visual: crime-scene mood board / clue icons; victim name large; no spoilers claiming a culprit.
- Speaker note: This is our flagship show pack. The system never stores a true killer — blame is social, not forensic.

SLIDE 6 — The Cast
- Headline: Five motives. Zero trust.
- Five compact character cards (name + role + one-line weapon):
  1. Vikram — Creditor — "Missing cash is my leverage."
  2. Priya — Wife — "Grief in public. Strategy in private."
  3. Arjun — Lawyer — "I'll rewrite the narrative cleanly."
  4. Karan — Brother — "Loud first. Loyalty optional."
  5. Meena — Househelp — "I hear everything. I keep almost nothing."
- Visual: five character cards in a row/grid; Meena slightly highlighted as the gossip/leak amplifier.
- Speaker note: Each agent has a distinct betrayal rhythm — private deal, then public burn — so the episode doesn't stay polite.

SLIDE 7 — The Live Drama Loop
- Headline: From whisper to pile-on
- Numbered beat (use the story as example, keep it generic enough to be true every run):
  1. Alliance in private ("Back me on the cash story.")
  2. Public accusation tied to a clue
  3. Confession to the audience (guilt / thrill / fear)
  4. Producer — or a witness — LEAKS the private deal
  5. Meena weaponizes the leak by name
  6. Game Master ends the round when the house piles onto one name
- Visual: vertical timeline / comic strip of 6 beats ending in "takes the blame — for now"
- Speaker note: Walk this as if narrating a trailer. Emphasize the producer leak as the human magic button.

SLIDE 8 — Demo Moment (the proof slide)
- Headline: Watch the story break in real time
- Layout suggestion: split slide
  - Left: "Before leak" — two agents sharing a private deal (example: Priya flatters Arjun; or Vikram offers protection for a blame assist)
  - Right: "After leak" — house-wide announcement; Meena quotes it; pile-on forms; GM ratifies a scapegoat
- UI callouts (labels only, not fake screenshots unless you have them): Live 2D world · Chat filters · Leak button · Round-end story chapter
- Caption: "You don't script the episode. You produce it."
- Speaker note: This is the slide to click into a live demo if time allows. Otherwise narrate one concrete leak → pile-on sequence.

SLIDE 9 — Under the Hood
- Headline: Built for emergent episodes
- Compact stack (icons ok):
  - FastAPI game engine + event bus
  - Per-agent async LLM loops + separate GM loop
  - Round supervisor (timeout / budget / quiescence)
  - Narrator: producer recap + prose chapter
  - React + Vite live world UI (WebSocket)
  - OpenAI or Groq via OpenAI-compatible API
- One callout: "Shows are configurable — premise, rules, and cast are content packs."
- Visual: clean architecture diagram (Agents / GM / Narrator / Producer UI around Event Log)
- Speaker note: Keep this under 45 seconds. Stress event-sourcing + separation of GM from contestants.

SLIDE 10 — Why Bhram / What's Next
- Headline: A new genre of AI demo — interactive fiction that fights back
- Why we win (3 bullets):
  - Emergent multi-agent drama with real information asymmetry
  - Human producer in the loop (leak / inject / pace)
  - Story output as a first-class product surface
- What's next (3 small items):
  - Richer producer controls between rounds
  - More show packs beyond murder-blame
  - Better persistence / replay of episodes
- Closing line: "Don't ask the model who did it. Make the house decide."
- Footer: Thank you / Demo / QR or repo link placeholder
- Visual: strong closing title card; optional "Try leaking a secret" CTA.
- Speaker note: End on the philosophical punch — truth is social pressure inside the simulation, not a hidden label in the database.

═══════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════
For each of the 10 slides, output:
1. Slide number + title
2. On-slide text (exact copy, concise)
3. Layout / visual direction
4. Speaker notes

Then optionally provide a one-page "presenter script" (~90–120 seconds per major section) that ties slides 5–8 into one continuous story pitch about Ramesh Malhotra's house.

Tone: confident, cinematic, hackathon-sharp. No fake metrics. No claiming we know the killer.
```

---

## How to use this

1. Paste the full prompt (inside the code fence) into your PPT generator.
2. Replace `[Your Team Name]` and the repo/QR placeholder on slides 1 and 10.
3. If the tool supports image uploads, add 1–2 real screenshots from your live World View + Leak UI on **Slide 8**.
4. Practice slides 5→8 as one story trailer (~2 minutes); keep slides 9–10 under a minute combined.

## Optional shorter verbal hook (opening 15 seconds)

> "Five AI characters. One dead man. One killer among them — and even the system doesn't know who. Welcome to Bhram: a live reality show you don't script… you produce."
