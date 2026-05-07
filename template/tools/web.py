"""Web fetch tool — fetch and parse web pages as markdown."""

import httpx


def fetch_webpage(url: str) -> dict:
    """
    Fetch a web page and return its content as plain text/markdown.
    Useful for reading articles, documentation, or any public URL.

    Args:
        url: The URL to fetch (must start with http:// or https://)

    Returns:
        dict with status, url, and content (or error message)
    """
    if not url.startswith(("http://", "https://")):
        return {"status": "error", "message": "URL must start with http:// or https://"}
    try:
        resp = httpx.get(url, follow_redirects=True, timeout=15)
        resp.raise_for_status()
        # Try markitdown for HTML conversion
        try:
            from markitdown import MarkItDown
            from io import BytesIO
            md = MarkItDown()
            result = md.convert_stream(BytesIO(resp.content), file_extension=".html")
            content = result.text_content[:8000]
        except Exception:
            content = resp.text[:8000]
        return {"status": "success", "url": url, "content": content}
    except httpx.HTTPStatusError as e:
        return {"status": "error", "message": f"HTTP {e.response.status_code}: {url}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
