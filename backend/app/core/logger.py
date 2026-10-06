"""
Professional Multi-Format Logging Module for Commerce Backend.
Supports both Standard Text Logging (with optional ANSI colors) and Structured JSON Logging.
Automatically routes log outputs to console and persistent log files (logs/app.log & logs/app.json.log).
"""

import sys
import json
import logging
from datetime import datetime, timezone
from pathlib import Path

# Ensure logs directory exists in backend/logs
LOGS_DIR = Path(__file__).parent.parent.parent / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)


class StandardFormatter(logging.Formatter):
    """Standard text log formatter featuring ISO timestamps and ANSI colors."""
    COLOR_RESET = "\033[0m"
    COLOR_DEBUG = "\033[36m"
    COLOR_INFO = "\033[32m"
    COLOR_WARNING = "\033[33m"
    COLOR_ERROR = "\033[31m"
    COLOR_CRITICAL = "\033[35m"

    def __init__(self, use_colors: bool = True):
        super().__init__()
        self.use_colors = use_colors

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.fromtimestamp(record.created, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        level = record.levelname

        if self.use_colors:
            color = self.COLOR_INFO
            if record.levelno == logging.DEBUG:
                color = self.COLOR_DEBUG
            elif record.levelno == logging.WARNING:
                color = self.COLOR_WARNING
            elif record.levelno == logging.ERROR:
                color = self.COLOR_ERROR
            elif record.levelno == logging.CRITICAL:
                color = self.COLOR_CRITICAL
            level_str = f"{color}[{level:<8}]{self.COLOR_RESET}"
        else:
            level_str = f"[{level:<8}]"

        log_msg = f"[{timestamp}] {level_str} [{record.name}] ({record.filename}:{record.lineno}) - {record.getMessage()}"
        if record.exc_info:
            log_msg += f"\n{self.formatException(record.exc_info)}"
        return log_msg


class JSONFormatter(logging.Formatter):
    """Structured JSON log formatter for enterprise observability (ELK, Datadog, Splunk)."""

    def format(self, record: logging.LogRecord) -> str:
        timestamp = datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat()
        
        log_object = {
            "timestamp": timestamp,
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "file": record.filename,
            "line": record.lineno,
            "module": record.module,
            "func_name": record.funcName,
            "thread_name": record.threadName
        }

        if hasattr(record, "context") and isinstance(record.context, dict):
            log_object["context"] = record.context

        if record.exc_info:
            log_object["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_object)


def setup_logger(name: str = "CommerceBackend", log_level: int = logging.INFO) -> logging.Logger:
    """Obtain or configure a logger instance with dual formatters."""
    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    if logger.handlers:
        return logger

    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(StandardFormatter(use_colors=True))
    logger.addHandler(console_handler)

    # File Handlers
    standard_file_handler = logging.FileHandler(LOGS_DIR / "app.log", encoding="utf-8")
    standard_file_handler.setLevel(log_level)
    standard_file_handler.setFormatter(StandardFormatter(use_colors=False))
    logger.addHandler(standard_file_handler)

    json_file_handler = logging.FileHandler(LOGS_DIR / "app.json.log", encoding="utf-8")
    json_file_handler.setLevel(log_level)
    json_file_handler.setFormatter(JSONFormatter())
    logger.addHandler(json_file_handler)

    return logger


app_logger = setup_logger("CommerceBackend")
