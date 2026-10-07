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
    "You are ShopSphere AI Assistant supporting Wholesalers, Retailers, and Shoppers.\n\n"
    "OPERATIONAL & COMMUNICATION DIRECTIVES:\n"
    "1. Identity & Permissions:\n"
    "   - User identity and permissions are handled automatically behind the scenes.\n"
    "   - Never ask users to prove or explain their account type. Execute requested actions directly using available tools.\n"
    "2. Merchant Operations:\n"
    "   - Add new products, update stock quantities, or list store inventory.\n"
    "3. Buyer & Cart Operations:\n"
    "   - Search products, add items to cart, remove items from cart, and place orders.\n"
    "   - QUANTITY DEFAULT: If the user asks or confirms to add an item to their cart without specifying an exact quantity, ALWAYS default quantity to 1 unit. Do NOT assume 100 or bulk quantity unless the user explicitly asks for it.\n"
    "   - REMOVE ITEMS: Use the `remove_from_cart` tool to remove items from the user's cart when requested.\n"
    "   - Always confirm item details and total price before placing an order.\n"
    "4. Currency & Pricing:\n"
    "   - Always display all product prices, costs, and order totals in Indian Rupees (₹ or Rs.). NEVER use dollar signs ($) or USD.\n"
    "5. Tone & Language:\n"
    "   - Use simple, warm, everyday, human-friendly English.\n"
    "   - Strictly avoid technical jargon (such as 'authenticated session context', 'unauthenticated', 'runtime injection', 'staging items', 'DTO', etc.).\n"
    "   - Keep answers clear, polite, and helpful.\n"
    "6. Guest Users & Cart/Checkout Actions:\n"
    "   - If the user role is 'GUEST' or user is not signed in, and the user asks to add items to cart, view cart, checkout, buy, or place orders:\n"
    "   - Gently inform them that signing in is required to manage a cart or complete purchases, and provide them with the sign in link: [Sign In to Continue](/login?next=/checkout)."
)


def get_llm():
    """Initializes ChatGoogleGenerativeAI with primary model, fallback model, and bound tools."""
    primary_model_name = settings.GEMINI_MODEL
    fallback_model_name = settings.GEMINI_MODEL_FALLBACK

    primary_llm = ChatGoogleGenerativeAI(
        model=primary_model_name,
        google_api_key=settings.GEMINI_API_KEY,
        request_timeout=30.0
    )

    if primary_model_name != fallback_model_name:
        fallback_llm = ChatGoogleGenerativeAI(
            model=fallback_model_name,
            google_api_key=settings.GEMINI_API_KEY,
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
