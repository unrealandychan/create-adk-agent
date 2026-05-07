"""{{PROJECT_NAME}} — ADK single agent."""

import datetime
from zoneinfo import ZoneInfo
from dotenv import load_dotenv

{{LITELM_IMPORT}}from google.adk.agents import Agent

load_dotenv()


def get_current_time(city: str) -> dict:
    """Get the current time in a given city. Returns time as a formatted string."""
    TIMEZONES = {
        "hong kong": "Asia/Hong_Kong",
        "london": "Europe/London",
        "new york": "America/New_York",
        "tokyo": "Asia/Tokyo",
        "sydney": "Australia/Sydney",
        "paris": "Europe/Paris",
    }
    tz_name = TIMEZONES.get(city.lower())
    if not tz_name:
        return {"status": "error", "message": f"Timezone for '{city}' not found."}
    now = datetime.datetime.now(ZoneInfo(tz_name))
    return {
        "status": "success",
        "city": city,
        "time": now.strftime("%Y-%m-%d %H:%M:%S %Z"),
    }


root_agent = Agent(
    name="{{PROJECT_NAME}}",
    model={{MODEL_EXPR}},
    description="A helpful AI assistant.",
    instruction="""
    You are a helpful and concise AI assistant.
    Use available tools when relevant to answer the user's question.
    Always be accurate, friendly, and brief.
    """,
    tools=[get_current_time],
)
