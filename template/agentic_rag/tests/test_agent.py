"""Tests for {{PROJECT_NAME}} RAG agent."""

import pytest
import tempfile, os

def test_root_agent_exists():
    from {{PROJECT_NAME}}.agent import root_agent
    assert root_agent.name == "{{PROJECT_NAME}}"

def test_load_documents_missing_folder():
    from {{PROJECT_NAME}}.agent import load_documents
    result = load_documents("/nonexistent/folder")
    assert result["status"] == "error"

def test_load_documents_success():
    from {{PROJECT_NAME}}.agent import load_documents, search_documents
    with tempfile.TemporaryDirectory() as tmpdir:
        (open(f"{tmpdir}/test.txt", "w")).write("ADK is a framework for building AI agents by Google.")
        result = load_documents(tmpdir)
        assert result["status"] == "success"
        assert result["loaded"] == 1

def test_search_no_docs():
    from {{PROJECT_NAME}}.agent import _DOCS, search_documents
    _DOCS.clear()
    result = search_documents("anything")
    assert result["status"] == "error"
