import pytest

from app.models import Agent, AgentStatus
from app.presets import (
    DEFAULT_SHOW_PROMPT, DEFAULT_GM_PROMPT, DEFAULT_RULES_TEXT,
    PRESET_AGENT_PERSONALITIES, GAMES, ANANTA_AGENTS, BLAME_AGENTS,
    build_preset_agent, get_game,
)

MURDER_IDS = {"creditor", "wife", "lawyer", "brother", "househelp"}
ANANTA_IDS = {
    "krishna", "karna", "shakuni", "arjun", "chanakya",
    "ravana", "hanuman", "vibhishana",
}


def test_defaults_are_nonempty_strings():
    assert DEFAULT_SHOW_PROMPT and isinstance(DEFAULT_SHOW_PROMPT, str)
    assert DEFAULT_GM_PROMPT and isinstance(DEFAULT_GM_PROMPT, str)
    assert DEFAULT_RULES_TEXT and isinstance(DEFAULT_RULES_TEXT, str)


def test_defaults_describe_the_murder_blame_premise():
    from app.presets import SHOW_TITLE
    assert SHOW_TITLE == "Bhram"
    assert "Bhram" in DEFAULT_SHOW_PROMPT
    assert "Ramesh Malhotra" in DEFAULT_SHOW_PROMPT
    assert "killer" in DEFAULT_SHOW_PROMPT.lower()
    assert "blame" in DEFAULT_GM_PROMPT.lower()
    assert "missing" in DEFAULT_SHOW_PROMPT.lower()
    assert "one of the five" in DEFAULT_RULES_TEXT.lower()
    assert "outsiders" in DEFAULT_GM_PROMPT.lower()


def test_preset_pool_has_five_unique_murder_cast_personalities():
    assert len(PRESET_AGENT_PERSONALITIES) == 5
    ids = {p["id"] for p in PRESET_AGENT_PERSONALITIES}
    assert ids == MURDER_IDS
    for preset in PRESET_AGENT_PERSONALITIES:
        prompt = preset["personality_prompt"].lower()
        assert preset["name"] and preset["personality_prompt"]
        assert "do not know who the killer is" in prompt \
            or "don't know who the killer is" in prompt
        assert "2 to 4 short sentences" in prompt
        assert "mysterious outsiders" in prompt
        assert "betrayal loop" in prompt


def test_househelp_calls_out_leaks_by_name():
    preset = next(p for p in PRESET_AGENT_PERSONALITIES if p["id"] == "househelp")
    prompt = preset["personality_prompt"].lower()
    assert "public leak" in prompt
    assert "name" in prompt


def test_ananta_game_has_eight_explorers_and_temple_premise():
    game = get_game("ananta")
    assert len(game["agents"]) == 8
    assert {a["id"] for a in game["agents"]} == ANANTA_IDS
    assert "Heart of Ananta" in game["show_prompt"]
    assert "temple" in game["gm_prompt"].lower()
    assert "heart" in game["rules_text"].lower()
    for preset in ANANTA_AGENTS:
        prompt = preset["personality_prompt"].lower()
        assert "betrayal loop" in prompt
        assert "do not know the true nature of the heart" in prompt
        assert "2 to 4 short sentences" in prompt


def test_games_registry_includes_blame_and_ananta():
    assert set(GAMES) == {"blame", "ananta"}
    assert len(BLAME_AGENTS) == 5
    assert get_game("blame")["agents"] is BLAME_AGENTS


def test_build_preset_agent_returns_active_agent():
    agent = build_preset_agent("creditor")
    assert isinstance(agent, Agent)
    assert agent.id == "creditor"
    assert agent.status == AgentStatus.ACTIVE


def test_build_preset_agent_works_for_ananta_cast():
    agent = build_preset_agent("krishna")
    assert agent.id == "krishna"
    assert "Strategist" in agent.name


def test_build_preset_agent_missing_raises():
    with pytest.raises(KeyError):
        build_preset_agent("strategist")
