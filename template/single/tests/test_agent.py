"""Tests for {{PROJECT_NAME}}."""

import pytest
from unittest.mock import patch, MagicMock


def test_root_agent_exists():
    from {{PROJECT_NAME}}.agent import root_agent
    assert root_agent is not None
    assert root_agent.name == "{{PROJECT_NAME}}"


def test_root_agent_has_tools():
    from {{PROJECT_NAME}}.agent import root_agent
    assert len(root_agent.tools) > 0


def test_get_current_time_known_city():
    from {{PROJECT_NAME}}.agent import get_current_time
    result = get_current_time("hong kong")
    assert result["status"] == "success"
    assert "time" in result


def test_get_current_time_unknown_city():
    from {{PROJECT_NAME}}.agent import get_current_time
    result = get_current_time("atlantis")
    assert result["status"] == "error"
