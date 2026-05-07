.PHONY: dev test

dev:
	uv run adk web

run:
	uv run adk run {{PROJECT_NAME}}

api:
	uv run adk api_server

test:
	uv run pytest -v

.DEFAULT_GOAL := dev
