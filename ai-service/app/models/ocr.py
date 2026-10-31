import numpy as np

class OCRService:
    def __init__(self):
        try:
            from paddleocr import PaddleOCR
            self.engine = PaddleOCR(
                lang="en",
                device="cpu",  # switch only after validating a supported GPU runtime
            )
            self._available = True
        except ImportError:
            self._available = False
            self.engine = None

    def extract(self, image):
        if not self._available:
            raise NotImplementedError(
                "PaddleOCR is not installed. Follow Section 6 of LF_Python_Inference_Setup.md to install supported runtime."
            )

        rgb = np.asarray(image.convert("RGB"))
        pages = self.engine.predict(input=rgb)
        extracted = []

        for page in pages or []:
            data = page.json
            if callable(data):
                data = data()
            if not isinstance(data, dict):
                continue
            data = data.get("res", data)

            texts = data.get("rec_texts", [])
            scores = data.get("rec_scores", [])
            for text, score in zip(texts, scores):
                extracted.append({
                    "text": str(text),
                    "confidence": float(score),
                })

        return extracted
