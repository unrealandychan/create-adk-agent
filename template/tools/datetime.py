"""Datetime tool — get current date/time for any timezone."""

import datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError


def get_current_time(city_or_timezone: str = "UTC") -> dict:
    """
    Get the current date and time for a city or timezone.

    Args:
        city_or_timezone: City name (e.g. 'Hong Kong', 'London') or
                          IANA timezone string (e.g. 'Asia/Hong_Kong', 'UTC')

    Returns:
        dict with status, timezone, datetime, date, time, weekday, unix_timestamp
    """
    CITY_MAP = {
        "hong kong": "Asia/Hong_Kong", "hk": "Asia/Hong_Kong",
        "london": "Europe/London", "uk": "Europe/London",
        "new york": "America/New_York", "nyc": "America/New_York",
        "los angeles": "America/Los_Angeles", "la": "America/Los_Angeles",
        "tokyo": "Asia/Tokyo", "japan": "Asia/Tokyo",
        "beijing": "Asia/Shanghai", "shanghai": "Asia/Shanghai", "china": "Asia/Shanghai",
        "sydney": "Australia/Sydney", "australia": "Australia/Sydney",
        "paris": "Europe/Paris", "france": "Europe/Paris",
        "berlin": "Europe/Berlin", "germany": "Europe/Berlin",
        "singapore": "Asia/Singapore", "sg": "Asia/Singapore",
        "dubai": "Asia/Dubai", "uae": "Asia/Dubai",
        "utc": "UTC",
    }
    tz_name = CITY_MAP.get(city_or_timezone.lower(), city_or_timezone)
    try:
        tz = ZoneInfo(tz_name)
    except ZoneInfoNotFoundError:
        return {"status": "error", "message": f"Unknown timezone or city: '{city_or_timezone}'"}

    now = datetime.datetime.now(tz)
    return {
        "status": "success",
        "input": city_or_timezone,
        "timezone": tz_name,
        "datetime": now.strftime("%Y-%m-%d %H:%M:%S %Z"),
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M:%S"),
        "weekday": now.strftime("%A"),
        "unix_timestamp": int(now.timestamp()),
    }
