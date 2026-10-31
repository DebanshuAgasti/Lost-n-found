#!/usr/bin/env python3
"""
Environment and dependency verification script for Lost & Found AI Microservice.
Verifies Python version, OS, distribution versions, module imports, CUDA status, and pip health.
"""

import importlib
import importlib.metadata
import platform
import shutil
import subprocess
import sys
from typing import Dict, List, Optional, Tuple

# Core packages required for basic API operations
CORE_PACKAGES = [
    "fastapi",
    "uvicorn",
    "pydantic",
    "torch",
    "torchvision",
    "transformers",
    "timm",
    "PIL",
    "cv2",
    "numpy",
    "safetensors",
    "huggingface_hub",
]

# Optional / planned packages for extended pipelines
OPTIONAL_PACKAGES = [
    "qdrant_client",
    "einops",
    "httpx",
    "pytest",
]

# Distributions to query via importlib.metadata
DISTRIBUTIONS = [
    "fastapi",
    "uvicorn",
    "starlette",
    "pydantic",
    "pydantic-settings",
    "python-multipart",
    "python-dotenv",
    "torch",
    "torchvision",
    "transformers",
    "timm",
    "open_clip_torch",
    "opencv-python-headless",
    "opencv-python",
    "pillow",
    "numpy",
    "safetensors",
    "tokenizers",
    "sentencepiece",
    "huggingface-hub",
    "huggingface_hub",
    "qdrant-client",
    "einops",
    "httpx",
    "httpx2",
    "httpcore",
    "httpcore2",
    "pytest",
]


def get_distribution_version(dist_name: str) -> Optional[str]:
    try:
        return importlib.metadata.version(dist_name)
    except importlib.metadata.PackageNotFoundError:
        return None


def check_module_import(module_name: str) -> Tuple[str, str]:
    """
    Returns (status, detail)
    Status is one of: 'OK', 'IMPORT FAILED', 'NOT INSTALLED'
    """
    try:
        mod = importlib.import_module(module_name)
        ver = getattr(mod, "__version__", None)
        detail = f"version {ver}" if ver else "imported successfully"
        return "OK", detail
    except ModuleNotFoundError as e:
        if e.name == module_name or (e.name and e.name.startswith(module_name + ".")):
            return "NOT INSTALLED", str(e)
        return "IMPORT FAILED", f"Missing submodule/dependency: {e}"
    except Exception as e:
        return "IMPORT FAILED", f"{type(e).__name__}: {e}"


def check_cuda_status() -> Dict[str, str]:
    status = {"available": "False", "version": "N/A", "device_count": "0", "device_name": "N/A"}
    try:
        import torch

        available = torch.cuda.is_available()
        status["available"] = str(available)
        if available:
            status["version"] = str(getattr(torch.version, "cuda", "Unknown"))
            count = torch.cuda.device_count()
            status["device_count"] = str(count)
            if count > 0:
                status["device_name"] = torch.cuda.get_device_name(0)
    except Exception as e:
        status["error"] = str(e)
    return status


def run_pip_check() -> Tuple[int, str]:
    """Runs `python -m pip check` using the active interpreter and checks `uv pip check` if uv is present."""
    lines = []
    return_code = 0

    # 1. Standard python -m pip check
    proc = subprocess.run(
        [sys.executable, "-m", "pip", "check"],
        capture_output=True,
        text=True,
    )
    if proc.returncode == 0:
        lines.append(f"Standard pip check: {proc.stdout.strip() or 'OK'}")
    else:
        err = (proc.stderr or proc.stdout).strip()
        if "No module named pip" in err:
            lines.append("Standard pip check: pip module not installed in venv (environment created via uv without seed)")
        else:
            lines.append(f"Standard pip check (exit {proc.returncode}): {err}")
            return_code = proc.returncode

    # 2. UV pip check
    uv_path = shutil.which("uv")
    if uv_path:
        try:
            uv_proc = subprocess.run(
                [uv_path, "pip", "check", "--python", sys.executable],
                capture_output=True,
                text=True,
            )
            uv_out = (uv_proc.stdout or uv_proc.stderr).strip()
            lines.append(f"UV pip check (exit {uv_proc.returncode}): {uv_out}")
            if uv_proc.returncode != 0:
                return_code = uv_proc.returncode
        except Exception as e:
            lines.append(f"UV check skipped: {e}")

    return return_code, "\n  ".join(lines)


def main() -> int:
    print("=" * 70)
    print("  L&F AI Service — Environment & Dependency Check")
    print("=" * 70)

    # 1. System Info
    print("\n[1] System Information")
    print(f"  Python Version : {sys.version.splitlines()[0]}")
    print(f"  Executable     : {sys.executable}")
    print(f"  OS / Platform  : {platform.system()} {platform.release()} ({platform.machine()})")
    print(f"  Architecture   : {platform.architecture()[0]}")

    # 2. Package Distributions
    print("\n[2] Package Distribution Check (importlib.metadata)")
    found_distributions = {}
    for dist in DISTRIBUTIONS:
        ver = get_distribution_version(dist)
        if ver:
            found_distributions[dist] = ver
            print(f"  {dist:<26} : {ver}")
        else:
            # Only print notable missing distributions
            if dist in ["qdrant-client", "einops", "httpx", "pytest"]:
                print(f"  {dist:<26} : NOT FOUND (Missing distribution)")

    # 3. Module Imports
    print("\n[3] Module Import Checks")
    core_failures: List[Tuple[str, str]] = []
    optional_warnings: List[Tuple[str, str]] = []

    print("  -- Core Dependencies --")
    for mod in CORE_PACKAGES:
        status, detail = check_module_import(mod)
        print(f"  {mod:<20} : [{status}] {detail}")
        if status != "OK":
            core_failures.append((mod, detail))

    print("\n  -- Optional / Extended Pipeline Dependencies --")
    for mod in OPTIONAL_PACKAGES:
        status, detail = check_module_import(mod)
        print(f"  {mod:<20} : [{status}] {detail}")
        if status != "OK":
            optional_warnings.append((mod, detail))

    # 4. Hardware / CUDA Status
    print("\n[4] Hardware & CUDA Acceleration")
    cuda_info = check_cuda_status()
    print(f"  CUDA Available : {cuda_info.get('available')}")
    if cuda_info.get("available") == "True":
        print(f"  CUDA Version   : {cuda_info.get('version')}")
        print(f"  GPU Count      : {cuda_info.get('device_count')}")
        print(f"  GPU Device     : {cuda_info.get('device_name')}")
    else:
        print("  CUDA is not active. Service will fall back to CPU.")

    # 5. Pip Consistency Check
    print("\n[5] Pip Consistency Check (`pip check`)")
    pip_code, pip_output = run_pip_check()
    print(f"  Exit code: {pip_code}")
    for line in pip_output.splitlines():
        print(f"  {line}")

    # Summary
    print("\n" + "=" * 70)
    print("  Summary:")
    print(f"  Core Dependencies Passed    : {len(CORE_PACKAGES) - len(core_failures)} / {len(CORE_PACKAGES)}")
    print(f"  Optional Dependencies Found : {len(OPTIONAL_PACKAGES) - len(optional_warnings)} / {len(OPTIONAL_PACKAGES)}")

    if core_failures:
        print("\n  CRITICAL CORE FAILURES:")
        for mod, err in core_failures:
            print(f"    - {mod}: {err}")
        print("\n  Environment status: UNHEALTHY (Core dependencies missing)")
        return 1

    if optional_warnings:
        print("\n  WARNINGS (Optional / Planned Dependencies):")
        for mod, err in optional_warnings:
            print(f"    - {mod}: {err}")
        print("\n  Environment status: HEALTHY (Core operational, optional packages identified)")
        return 0

    print("\n  Environment status: FULLY HEALTHY")
    return 0


if __name__ == "__main__":
    sys.exit(main())
