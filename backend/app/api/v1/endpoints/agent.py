"""
FastAPI Presentation Endpoint Router for AI Agent Operations.
Provides endpoints for health, tools listing, session thread management,
turn queries, and real-time SSE (Server-Sent Events) streaming.
Strictly extracts identity from JWT credentials and injects into LangGraph runtime config.
"""

from typing import List, Dict, Any, Optional
import json
import asyncio
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from langchain_core.messages import HumanMessage

from app.api.deps import get_db, optional_user, get_current_user
from app.models.user import User, Role
from app.schemas.agent import (
    AgentQueryRequest, AgentQueryResponse, AgentSessionCreate,
    AgentSessionRead, ToolDefinition
)
from app.services.agent_service import agent_db_service
from app.agent.graph import agent_graph, build_commerce_agent
from app.agent.tools import all_tools
from app.core.config import settings
from app.core.logger import app_logger
from app.core.response import success_response
from app.core.exceptions import AgentWorkflowError, AuthenticationError

router = APIRouter(prefix="/agent", tags=["agent"])


@router.get("/health")
async def agent_health():
    """Health check for AI agent system."""
    return success_response(
        data={
            "status": "healthy",
            "agent": "LangGraph Commerce Agent",
            "model": settings.GEMINI_MODEL,
            "tools_count": len(all_tools)
        },
        message="Agent system operating normally"
    )


@router.get("/tools")
async def list_agent_tools():
    """List registered LangChain tools available to the Commerce Agent."""
    tools_list = [
        ToolDefinition(name=tool.name, description=tool.description or "").model_dump()
        for tool in all_tools
    ]
    return success_response(
        data=tools_list,
        message="Agent tools listed successfully"
    )


@router.get("/sessions")
async def list_user_sessions(
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(optional_user)
):
    """List persistent session threads for current authenticated user."""
    user_id_str = str(user.id) if user else "guest"
    sessions = await agent_db_service.list_sessions(db, user_id=user_id_str)
    return success_response(
        data=[s.model_dump() for s in sessions],
        message="Agent sessions retrieved successfully"
    )


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_new_session(
    payload: AgentSessionCreate,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(optional_user)
):
    """Create and persist a new chat session thread in shop.db."""
    user_id_str = str(user.id) if user else "guest"
    session = await agent_db_service.create_session(
        db,
        user_id=user_id_str,
        title=payload.title or "New Session"
    )
    return success_response(
        data=session.model_dump(),
        message="Chat session created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.get("/sessions/{thread_id}/history")
async def get_session_history(
    thread_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve message trajectory history for a thread session."""
    history = await agent_db_service.get_session_messages(db, thread_id=thread_id)
    return success_response(
        data=history,
        message="Session trajectory history retrieved successfully"
    )


@router.post("/query")
@router.post("/chat")
async def chat_or_query_agent(
    req: AgentQueryRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(optional_user)
):
    """
    Execute AI Agent turn via LangGraph StateGraph.
    Extracts identity strictly from JWT credentials and injects into runtime configuration.
    """
    thread_id = req.thread_id or "session_default"
    user_id_str = str(user.id) if user else "GUEST_USER"
    user_role_str = user.role.value if user else "GUEST"
    merchant_id_str = f"M_{user_role_str}_{user_id_str}" if user else None

    # Save user message to shop.db
    await agent_db_service.save_message(db, thread_id=thread_id, sender="user", text=req.message)

    # Configurable runtime injection for security & horizontal privilege prevention
    configurable = {
        "thread_id": thread_id,
        "user_id": user_id_str,
        "role": user_role_str
    }
    if merchant_id_str:
        configurable["merchant_id"] = merchant_id_str

    config = {"configurable": configurable}

    try:
        # Prompt contains ONLY the raw message; no plain-text identity strings!
        input_state = {"messages": [HumanMessage(content=req.message)]}

        # Execute turn on compiled agent graph
        output_state = agent_graph.invoke(input_state, config=config)
        messages = output_state.get("messages", [])

        if not messages:
            raise AgentWorkflowError("No response generated by agent workflow.")

        last_message = messages[-1]
        raw_content = getattr(last_message, "content", str(last_message))

        def extract_text(content: Any) -> str:
            if isinstance(content, str):
                return content
            elif isinstance(content, dict):
                return content.get("text", str(content))
            elif isinstance(content, list):
                parts = []
                for block in content:
                    if isinstance(block, str):
                        parts.append(block)
                    elif isinstance(block, dict):
                        parts.append(block.get("text", str(block)))
                return "\n".join(parts)
            return str(content)

        reply_content = extract_text(raw_content)

        tool_calls_count = sum(
            len(getattr(m, "tool_calls", [])) for m in messages if hasattr(m, "tool_calls") and m.tool_calls
        )
        metadata = {"status": "success", "tool_calls_count": tool_calls_count}

        # Save agent reply to shop.db
        await agent_db_service.save_message(
            db,
            thread_id=thread_id,
            sender="agent",
            text=reply_content,
            metadata=metadata
        )

        response_dto = AgentQueryResponse(
            reply=reply_content,
            status="success",
            thread_id=thread_id,
            metadata=metadata
        )

        return success_response(
            data=response_dto.model_dump(),
            message="Agent turn executed successfully"
        )

    except Exception as e:
        app_logger.error(f"Error processing agent query turn: {str(e)}", exc_info=True)
        raise AgentWorkflowError(f"Agent turn failed: {str(e)}")


@router.get("/stream")
async def stream_agent_query(
    message: str = Query(..., min_length=1),
    thread_id: str = Query("session_default"),
    user: Optional[User] = Depends(optional_user)
):
    """
    Real-time Server-Sent Events (SSE) streaming endpoint for AI Agent message tokens.
    """
    user_id_str = str(user.id) if user else "GUEST_USER"
    user_role_str = user.role.value if user else "GUEST"

    configurable = {
        "thread_id": thread_id,
        "user_id": user_id_str,
        "role": user_role_str
    }
    config = {"configurable": configurable}

    async def event_generator():
        try:
            yield f"event: start\ndata: {json.dumps({'thread_id': thread_id})}\n\n"
            events = agent_graph.astream(
                {"messages": [HumanMessage(content=message)]},
                config=config,
                stream_mode="values"
            )
            async for event in events:
                if "messages" in event and event["messages"]:
                    last_msg = event["messages"][-1]
                    if getattr(last_msg, "type", "") == "ai" and hasattr(last_msg, "content"):
                        content = str(last_msg.content)
                        chunk = {"type": "ai_message", "content": content}
                        yield f"event: message\ndata: {json.dumps(chunk)}\n\n"
                        await asyncio.sleep(0.01)

            yield f"event: end\ndata: {json.dumps({'status': 'completed'})}\n\n"
        except Exception as e:
            error_chunk = {"status": "error", "message": str(e)}
            yield f"event: error\ndata: {json.dumps(error_chunk)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
