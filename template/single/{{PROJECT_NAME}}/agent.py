"""{{PROJECT_NAME}} — ADK single agent."""

from dotenv import load_dotenv
{{LITELM_IMPORT}}{{TOOLS_IMPORTS}}from google.adk.agents import Agent

load_dotenv()
{{MCP_NOTE}}

root_agent = Agent(
    name="{{PROJECT_NAME}}",
    model={{MODEL_EXPR}},
    description="A helpful AI assistant.",
    instruction="""
    You are a helpful and concise AI assistant.
    Use available tools when relevant to answer the user's question.
    Always be accurate, friendly, and brief.
    """,
    tools=[{{TOOLS_LIST}}],
)
