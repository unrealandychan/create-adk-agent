"""File reader tool — read local files including PDFs, Word docs, Excel sheets."""

from pathlib import Path


def read_file(file_path: str, max_chars: int = 8000) -> dict:
    """
    Read a local file and return its content as text.
    Supports: .txt, .md, .py, .json, .csv, .pdf, .docx, .xlsx, and more.

    Args:
        file_path: Path to the file (absolute or relative to project root)
        max_chars: Maximum characters to return (default 8000)

    Returns:
        dict with status, file_path, extension, and content (or error message)
    """
    p = Path(file_path)
    if not p.exists():
        return {"status": "error", "message": f"File not found: {file_path}"}
    if not p.is_file():
        return {"status": "error", "message": f"Not a file: {file_path}"}

    ext = p.suffix.lower()
    try:
        # Rich formats via markitdown
        if ext in {".pdf", ".docx", ".xlsx", ".pptx", ".html", ".htm"}:
            from markitdown import MarkItDown
            md = MarkItDown()
            result = md.convert(str(p))
            content = result.text_content[:max_chars]
        else:
            content = p.read_text(errors="replace")[:max_chars]
        return {"status": "success", "file_path": str(p), "extension": ext, "content": content}
    except Exception as e:
        return {"status": "error", "message": str(e)}


def list_files(directory: str = ".", pattern: str = "*") -> dict:
    """
    List files in a directory matching a glob pattern.

    Args:
        directory: Directory path to list (default: current directory)
        pattern: Glob pattern (e.g. '*.py', '**/*.md', default '*')

    Returns:
        dict with status and list of file paths
    """
    p = Path(directory)
    if not p.exists():
        return {"status": "error", "message": f"Directory not found: {directory}"}
    files = [str(f) for f in sorted(p.glob(pattern)) if f.is_file()]
    return {"status": "success", "directory": str(p), "pattern": pattern, "files": files}
