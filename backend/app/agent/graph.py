"""
LangGraph Agent Architecture Module.
Implements stateful multi-role Commerce Agent graph using StateGraph,
MemorySaver checkpointer for thread persistence, ToolNode,
and message context trimming.
"""

from typing import Annotated, TypedDict, Optional
import os
from langchain_core.messages import BaseMessage, SystemMessage, trim_messages
from langchain_core.runnables import RunnableConfig
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver

from app.core.config import settings
from app.agent.tools import all_tools
from app.core.logger import app_logger


class AgentState(TypedDict):
    """Strictly typed agent state using add_messages reducer for message trajectory."""
    messages: Annotated[list[BaseMessage], add_messages]


SYSTEM_PROMPT_TEXT = (
    "You are an enterprise ShopShphere AI Assistant supporting Wholesalers, Retailers, and Buyers.\n\n"
    "SECURITY & OPERATIONAL DIRECTIVES:\n"
    "1. Identity & Authorization Context is injected into tool execution via runtime session configuration.\n"
    "2. Never ask the user to declare or prove their identity in prompts. Always execute actions on their behalf using bound tools.\n"
    "3. Merchant Operations:\n"
    "   - List products, update inventory stock, or view inventory.\n"
    "4. Buyer Operations:\n"
    "   - Search the catalog, stage items to cart, and checkout orders.\n"
    "   - Always confirm staged items or order details before executing checkout_cart.\n"
    "5. Currency Directive:\n"
    "   - Always display all product prices, monetary values, costs, and totals in Indian Rupees (₹ or Rs.). NEVER use dollar signs ($) or USD.\n"
    "6. Output Format:\n"
    "   - Keep responses professional, clear, concise, and structured."
)


def get_llm():
    """Initializes ChatGoogleGenerativeAI with primary model, fallback model, and bound tools."""
    primary_model_name = settings.GEMINI_MODEL
    fallback_model_name = settings.GEMINI_MODEL_FALLBACK

    primary_llm = ChatGoogleGenerativeAI(
        model=primary_model_name,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=0.2,
        request_timeout=30.0
    )

    if primary_model_name != fallback_model_name:
        fallback_llm = ChatGoogleGenerativeAI(
            model=fallback_model_name,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
            request_timeout=30.0
        )
        llm = primary_llm.with_fallbacks([fallback_llm])
    else:
        llm = primary_llm

    return llm.bind_tools(all_tools)


async def agent_node(state: AgentState, config: RunnableConfig) -> dict:
    """Agent node that applies message window trimming, system prompt injection, and model invocation."""
    raw_messages = list(state["messages"])

    trimmed = trim_messages(
        raw_messages,
        max_tokens=2000,
        strategy="last",
        token_counter=len,
        start_on="human",
        include_system=False
    )

    system_msg = SystemMessage(content=SYSTEM_PROMPT_TEXT)
    messages_to_send = [system_msg] + list(trimmed)

    llm_with_tools = get_llm()
    response = await llm_with_tools.ainvoke(messages_to_send, config=config)
    return {"messages": [response]}


async def build_commerce_agent():
    """Constructs and compiles the StateGraph with MemorySaver checkpointer."""
    builder = StateGraph(AgentState)

    builder.add_node("agent", agent_node)
    builder.add_node("tools", ToolNode(all_tools))

    builder.add_edge(START, "agent")
    builder.add_conditional_edges("agent", tools_condition)
    builder.add_edge("tools", "agent")

    checkpointer = MemorySaver()
    return builder.compile(checkpointer=checkpointer)


def create_commerce_agent():
    """Synchronous StateGraph builder fallback."""
    builder = StateGraph(AgentState)
    builder.add_node("agent", agent_node)
    builder.add_node("tools", ToolNode(all_tools))
    builder.add_edge(START, "agent")
    builder.add_conditional_edges("agent", tools_condition)
    builder.add_edge("tools", "agent")
    checkpointer = MemorySaver()
    return builder.compile(checkpointer=checkpointer)


agent_graph = create_commerce_agent()
