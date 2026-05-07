"""Tests for {{PROJECT_NAME}} multi-agent."""

def test_root_agent_exists():
    from {{PROJECT_NAME}}.agent import root_agent
    assert root_agent.name == "{{PROJECT_NAME}}"

def test_root_agent_has_sub_agents():
    from {{PROJECT_NAME}}.agent import root_agent
    assert len(root_agent.sub_agents) == 2

def test_specialist_agents():
    from {{PROJECT_NAME}}.agent import research_agent, writer_agent
    assert research_agent.name == "research_agent"
    assert writer_agent.name == "writer_agent"
