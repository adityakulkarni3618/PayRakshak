import subprocess


def scan_file(path: str) -> bool:
    """Scan a file with ClamAV.

    Returns True if the file is clean, False if a virus is detected or an error occurs.
    """
    try:
        # clamdscan returns exit code 0 if clean, 1 if a virus is found, >1 on error
        result = subprocess.run(["clamdscan", "--no-summary", path], capture_output=True, text=True, timeout=10)
        return result.returncode == 0
    except Exception as e:
        # In production you would log the exception; here we just treat as unsafe
        return False
