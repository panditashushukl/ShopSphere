"""
Agent Execution Runner and Interactive CLI Module.
Encapsulates session turn streaming and interactive CLI loop for LangGraph Commerce Agent.
"""

from typing import Optional
from langchain_core.messages import HumanMessage

from app.core.logger import app_logger


def run_agent_session(
    prompt: str,
    thread_id: str,
    merchant_id: Optional[str] = None,
    customer_id: Optional[str] = None,
    user_id: Optional[str] = None,
    role: Optional[str] = None
):
    """Executes a single turn with the LangGraph agent for a given thread_id and injected context."""
    configurable = {"thread_id": thread_id}
    if merchant_id:
        configurable["merchant_id"] = merchant_id
    if customer_id:
        configurable["customer_id"] = customer_id
    if user_id:
        configurable["user_id"] = user_id
    if role:
        configurable["role"] = role

    config = {"configurable": configurable}
    app_logger.info(f"[Thread: {thread_id}] User > {prompt}")

    try:
        from app.agent.graph import agent_graph
        events = agent_graph.stream(
            {"messages": [HumanMessage(content=prompt)]},
            config=config,
            stream_mode="values"
        )
        for event in events:
            if "messages" in event and event["messages"]:
                last_msg = event["messages"][-1]
                if hasattr(last_msg, "content") and last_msg.content:
                    if getattr(last_msg, "type", "") == "ai":
                        content = last_msg.content
                        if isinstance(content, dict):
                            text = content.get("text", str(content))
                        elif isinstance(content, list):
                            text = "\n".join(b.get("text", str(b)) if isinstance(b, dict) else str(b) for b in content)
                        else:
                            text = str(content)
                        app_logger.info(f"[Thread: {thread_id}] Agent > {text}")

    except Exception as e:
        app_logger.error(f"[Thread: {thread_id}] Execution Error: {str(e)}", exc_info=True)


def run_interactive_cli():
    """Interactive CLI interface to prompt the agent under custom thread IDs and session context."""
    app_logger.info("Entering Interactive Commerce Agent CLI.")
    app_logger.info("Type 'exit' or 'quit' to stop.")
    app_logger.info("Commands: /thread <thread_id> | /role <role> | /user_id <user_id>")

    current_thread = "session_01"
    current_user_id = "1"
    current_role = "WHOLESALER"

    while True:
        try:
            user_input = input(f"\n[{current_thread} | {current_role}] You: ").strip()
            if not user_input:
                continue
            if user_input.lower() in ["exit", "quit"]:
                app_logger.info("Exiting CLI. Goodbye!")
                break
            if user_input.startswith("/thread "):
                current_thread = user_input.split(" ", 1)[1].strip()
                app_logger.info(f"Switched active thread to: {current_thread}")
                continue
            if user_input.startswith("/role "):
                current_role = user_input.split(" ", 1)[1].strip()
                app_logger.info(f"Set active role to: {current_role}")
                continue
            if user_input.startswith("/user_id "):
                current_user_id = user_input.split(" ", 1)[1].strip()
                app_logger.info(f"Set active user_id to: {current_user_id}")
                continue

            run_agent_session(
                prompt=user_input,
                thread_id=current_thread,
                user_id=current_user_id,
                role=current_role
            )
        except KeyboardInterrupt:
            app_logger.info("Exiting CLI.")
            break
