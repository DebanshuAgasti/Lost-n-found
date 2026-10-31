from typing import List, Dict, Any

class GroundingDINOService:
    def __init__(self):
        # Load the chosen official model/checkpoint here.
        # Follow the current repository instructions and preprocessing.
        self._available = False

    def detect(self, image, prompt: str) -> List[Dict[str, Any]]:
        # Run the detector, post-process boxes, and return coordinates
        # relative to the original image:
        # [{"label": "backpack", "confidence": 0.92,
        #   "box": [x1, y1, x2, y2]}]
        raise NotImplementedError(
            "Install and initialize a supported Grounding DINO runtime according to Section 7 of LF_Python_Inference_Setup.md"
        )
