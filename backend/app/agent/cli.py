"""
CLI Entry Point for Commerce AI Agent.
Encapsulates CLI banner initialization and execution invocation.
"""

from app.core.config import settings
from app.core.logger import setup_logger
from app.agent.runner import run_interactive_cli

logger = setup_logger("CommerceAgentCLI")


def main():
    """Main CLI execution entry point."""
    logger.info("==================================================================")
    logger.info("              COMMERCE AGENT MULTI-ROLE SYSTEM                    ")
    logger.info("==================================================================")

    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY is unset or default placeholder in .env.")
        logger.warning("To run live AI agent sessions via LangGraph & Gemini LLM, set a valid key in .env.")
        return

    run_interactive_cli()


if __name__ == "__main__":
    main()
