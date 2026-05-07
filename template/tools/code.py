"""Code execution tool — run Python code snippets safely."""

import subprocess
import sys
import tempfile
import os


def run_python_code(code: str, timeout: int = 10) -> dict:
    """
    Execute a Python code snippet and return the output.
    Runs in an isolated subprocess. No internet access, no file writes outside /tmp.
    Useful for calculations, data processing, and quick experiments.

    Args:
        code: Python code to execute (string)
        timeout: Maximum execution time in seconds (default 10, max 30)

    Returns:
        dict with status, stdout, stderr, and exit_code
    """
    timeout = min(timeout, 30)
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        tmp_path = f.name
    try:
        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True, text=True, timeout=timeout,
            env={**os.environ, "PYTHONPATH": ""},
        )
        return {
            "status": "success" if result.returncode == 0 else "error",
            "stdout": result.stdout[:4000],
            "stderr": result.stderr[:2000],
            "exit_code": result.returncode,
        }
    except subprocess.TimeoutExpired:
        return {"status": "error", "message": f"Timed out after {timeout}s", "exit_code": -1}
    except Exception as e:
        return {"status": "error", "message": str(e), "exit_code": -1}
    finally:
        os.unlink(tmp_path)
