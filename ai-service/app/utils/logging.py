import logging
import sys

def configure_logging(level: int = logging.INFO) -> None:
    """
    Configures standard application logging.
    Privacy policy: Never log raw image payloads, user secrets, or PII.
    """
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

