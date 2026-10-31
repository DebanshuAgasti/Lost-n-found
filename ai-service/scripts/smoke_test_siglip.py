#!/usr/bin/env python3
"""
Manual smoke-test script for Google SigLIP (google/siglip-base-patch16-224).
Loads the model weights on demand, generates one image embedding and one text embedding,
verifies that their dimensions match, verifies L2 normalization, and checks cosine similarity.

Usage:
  cd ai-service
  .\\.venv\\Scripts\\python.exe scripts/smoke_test_siglip.py
"""

import math
import os
import sys
import time
from pathlib import Path

# Ensure ai-service root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import numpy as np
from PIL import Image
import torch

from app.models.siglip_model import SigLIPModel


def compute_l2_norm(vec):
    return math.sqrt(sum(x * x for x in vec))


def compute_cosine_similarity(vec_a, vec_b):
    dot = sum(a * b for a, b in zip(vec_a, vec_b))
    norm_a = compute_l2_norm(vec_a)
    norm_b = compute_l2_norm(vec_b)
    return dot / (norm_a * norm_b) if norm_a > 0 and norm_b > 0 else 0.0


def main() -> int:
    print("=" * 70)
    print("  L&F AI Service — SigLIP Inference & Embedding Smoke Test")
    print("=" * 70)

    # 1. Environment & Hardware Probe
    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU"
    print(f"\n[1] Hardware Context:")
    print(f"  PyTorch Version : {torch.__version__}")
    print(f"  CUDA Available  : {cuda_available}")
    if cuda_available:
        print(f"  CUDA Device     : {device_name}")
        print(f"  CUDA Capability : {torch.cuda.get_device_capability(0)}")

    # 2. Model Initialization
    print(f"\n[2] Initializing SigLIP Model Adapter...")
    t0 = time.perf_counter()
    siglip = SigLIPModel()
    print(f"  Target Model ID : {siglip.model_id}")
    print(f"  Selected Device : {siglip.device}")
    print(f"  Model Loaded?   : {siglip.is_loaded} (Enforcing lazy loading)")

    # 3. Model Loading (First demand)
    print(f"\n[3] Triggering Model Weight Loading...")
    siglip.load()
    load_time = time.perf_counter() - t0
    print(f"  Model Loaded in : {load_time:.2f} seconds")
    print(f"  Model Loaded?   : {siglip.is_loaded}")
    print(f"  Verified Config Dimension : {siglip.dimension}")

    if cuda_available and siglip.device == "cuda":
        vram_mb = torch.cuda.memory_allocated() / (1024 * 1024)
        print(f"  VRAM Allocated  : {vram_mb:.2f} MB")

    # 4. Generate Synthetic Test Image
    print(f"\n[4] Generating Test Image Embedding...")
    arr = np.zeros((224, 224, 3), dtype=np.uint8)
    arr[:, :, 0] = 30   # Deep navy blue
    arr[:, :, 2] = 160
    arr[60:160, 60:160, :] = 200 # Contrasting center patch
    test_image = Image.fromarray(arr)

    t_img_start = time.perf_counter()
    img_vector, img_dim = siglip.embed_image(test_image)
    img_time = time.perf_counter() - t_img_start

    img_norm = compute_l2_norm(img_vector)
    print(f"  Image Input Size     : {test_image.size}")
    print(f"  Inference Latency    : {img_time * 1000:.2f} ms")
    print(f"  Embedding Dimension  : {img_dim}")
    print(f"  Vector Length        : {len(img_vector)}")
    print(f"  Vector L2 Norm       : {img_norm:.6f} (Expected: ~1.000000)")
    print(f"  First 5 Vector Values: {[round(x, 5) for x in img_vector[:5]]}")

    # 5. Generate Test Text Embedding
    test_text = "Lost navy blue Herschel backpack with silver zipper"
    print(f"\n[5] Generating Test Text Embedding...")
    print(f"  Query Text           : '{test_text}'")

    t_txt_start = time.perf_counter()
    txt_vector, txt_dim = siglip.embed_text(test_text)
    txt_time = time.perf_counter() - t_txt_start

    txt_norm = compute_l2_norm(txt_vector)
    print(f"  Inference Latency    : {txt_time * 1000:.2f} ms")
    print(f"  Embedding Dimension  : {txt_dim}")
    print(f"  Vector Length        : {len(txt_vector)}")
    print(f"  Vector L2 Norm       : {txt_norm:.6f} (Expected: ~1.000000)")
    print(f"  First 5 Vector Values: {[round(x, 5) for x in txt_vector[:5]]}")

    # 6. Verify Architectural Invariants
    print(f"\n[6] Verifying Cross-Modal Invariants...")
    dim_match = (img_dim == txt_dim == siglip.dimension)
    print(f"  Dimension Match (Image == Text == {siglip.dimension}) : {'PASS' if dim_match else 'FAIL'}")

    img_norm_ok = math.isclose(img_norm, 1.0, rel_tol=1e-4)
    txt_norm_ok = math.isclose(txt_norm, 1.0, rel_tol=1e-4)
    print(f"  Image Vector Unit Normalization (L2 == 1.0)          : {'PASS' if img_norm_ok else 'FAIL'}")
    print(f"  Text Vector Unit Normalization (L2 == 1.0)           : {'PASS' if txt_norm_ok else 'FAIL'}")

    cos_sim = compute_cosine_similarity(img_vector, txt_vector)
    print(f"  Cross-Modal Cosine Similarity (Image x Text)         : {cos_sim:.4f}")

    # 7. Summary
    print("\n" + "=" * 70)
    all_passed = dim_match and img_norm_ok and txt_norm_ok and (img_dim > 0)
    if all_passed:
        print("  SMOKE TEST RESULT: SUCCESS")
        print(f"  SigLIP pipeline verified on {siglip.device} with dimension {siglip.dimension}!")
        print("=" * 70)
        return 0
    else:
        print("  SMOKE TEST RESULT: FAILED (Invariants violated)")
        print("=" * 70)
        return 1


if __name__ == "__main__":
    sys.exit(main())
