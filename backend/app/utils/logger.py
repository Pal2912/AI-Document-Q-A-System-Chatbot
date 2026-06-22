"""
Shared application logger.

Usage in any file:
    from app.utils.logger import logger
    logger.info("Something happened")
    logger.error("Something went wrong: %s", str(e))
"""

import logging
import sys

logger = logging.getLogger("rag_chatbot")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
