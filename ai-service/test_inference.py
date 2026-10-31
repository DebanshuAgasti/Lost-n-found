import sys
import torch
import numpy as np
from PIL import Image

def test_environment():
    print("=" * 60)
    print("Testing PyTorch & CUDA Environment")
    print("=" * 60)
    print(f"Python Version: {sys.version}")
    print(f"PyTorch Version: {torch.__version__}")
    cuda_ok = torch.cuda.is_available()
    print(f"CUDA Available: {cuda_ok}")
    if cuda_ok:
        print(f"CUDA Device Count: {torch.cuda.device_count()}")
        print(f"Device Name: {torch.cuda.get_device_name(0)}")
        print(f"Device Capability: {torch.cuda.get_device_capability(0)}")
    else:
        print("Note: Running on CPU.")
    print("=" * 60)

def test_siglip_inference():
    print("\nTesting SigLIP Inference (google/siglip-base-patch16-224)...")
    try:
        from app.registry import get_registry

        registry = get_registry()
        siglip = registry.siglip

        # Create a test synthetic 224x224 RGB image
        arr = np.zeros((224, 224, 3), dtype=np.uint8)
        arr[:, :, 2] = 200 # blue tone
        arr[50:150, 50:150, :] = 180
        test_img = Image.fromarray(arr)

        # 1. Test embedding
        vector = siglip.embed(test_img)
        print(f"SigLIP Embedding generated! Dimension: {len(vector)}")
        print(f"First 5 vector values: {vector[:5]}")
        assert len(vector) == 768, f"Expected 768-dim SigLIP embedding, got {len(vector)}"

        # 2. Test zero-shot classification
        labels = ["backpack", "wallet", "mobile phone", "laptop", "keys", "water bottle"]
        rankings = siglip.classify(test_img, labels)
        print("SigLIP Zero-shot Classification Rankings:")
        for r in rankings[:3]:
            print(f"  - {r['label']}: score={r['score']:.4f}")

        print("PASS: SigLIP model passed embedding & classification tests!")
        print("=" * 60)
        return True
    except Exception as e:
        print(f"SigLIP test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_environment()
    test_siglip_inference()
