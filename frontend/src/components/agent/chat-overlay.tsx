"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore, ChatMessage } from "@/lib/store/use-app-store";
import { siteConfig } from "@/config/site.config";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  Maximize2,
  Plus,
  History as HistoryIcon,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SessionItem {
  thread_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

const SUGGESTED_PROMPTS = [
  "Search catalog for Wireless Mouse",
  "Check my active procurement order status",
  "Inspect current wholesale inventory ledger",
  "Show minimum order quantity policies",
];

export const ChatOverlay: React.FC = () => {
  const pathname = usePathname();
  const {
    isChatOpen,
    toggleChat,
    activeThreadId,
    setActiveThreadId,
    messages,
    addMessage,
    setMessages,
    user,
  } = useAppStore();

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    }, 60);
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  useEffect(() => {
    if (showHistory) {
      const fetchSessions = async () => {
        try {
          const res = await fetch(
            `${siteConfig.api.baseUrl}${siteConfig.api.endpoints.agent.sessions}?user_id=${user?.id || "guest"}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.data && Array.isArray(data.data)) {
              setSessions(data.data);
            }
          }
        } catch (err) {
          console.error("Failed to load session history:", err);
        }
      };
      fetchSessions();
    }
  }, [showHistory, user?.id]);

  const handleStartNewThread = () => {
    const newThreadId = `session_${Date.now()}`;
    setActiveThreadId(newThreadId);
    setMessages([]);
    setShowHistory(false);
  };

  const handleClearCurrentMessages = () => {
    setMessages([]);
  };

  const handleSelectSession = async (threadId: string) => {
    setActiveThreadId(threadId);
    setShowHistory(false);
    setIsLoading(true);
    try {
      const res = await fetch(
        `${siteConfig.api.baseUrl}${siteConfig.api.endpoints.agent.history(threadId)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.data && Array.isArray(data.data)) {
          setMessages(data.data);
        } else {
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to load history for thread:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${siteConfig.api.baseUrl}${siteConfig.api.endpoints.agent.query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: promptText,
          thread_id: activeThreadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Agent query failed with status ${response.status}`);
      }

      const envelope = await response.json();
      const replyText = envelope?.data?.reply || "The SS Agent completed your request.";

      const agentMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: "agent",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metadata: envelope?.data?.metadata,
      };

      addMessage(agentMessage);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: "agent",
        text: `Network Error: ${err.message || "Failed to reach SS Agent."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (
    pathname === "/agent" ||
    pathname === "/agents" ||
    pathname?.startsWith("/agent/") ||
    pathname?.startsWith("/agents/")
  ) {
    return null;
  }

  if (!isChatOpen) {
    return (
      <button
        onClick={() => toggleChat(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-surface text-foreground border border-subtle shadow-xl hover:scale-105 transition-all duration-200 group"
        aria-label="Open SS Agent Chat"
      >
        <div className="relative">
          <Bot className="w-6 h-6 text-amber-primary" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-primary rounded-full ring-2 ring-surface" />
        </div>
        <span className="font-semibold text-sm tracking-wide">SS Agent</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-4rem)] flex flex-col bg-surface text-foreground rounded-2xl border border-subtle shadow-2xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-canvas border-b border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-surface border border-subtle text-amber-primary">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              SS Agent
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-surface text-amber-primary border border-subtle font-mono">
                {user ? user.role : "GUEST"}
              </span>
            </h3>
            <p className="text-xs text-text-muted font-mono truncate max-w-[140px]">
              Thread: {activeThreadId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleStartNewThread}
            className="p-2 text-text-muted hover:text-amber-primary hover:bg-surface rounded-lg transition-colors"
            title="Start New Thread (+)"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 rounded-lg transition-colors ${showHistory
                ? "text-amber-primary bg-amber-surface"
                : "text-text-muted hover:text-foreground hover:bg-surface"
              }`}
            title="Session History"
          >
            <HistoryIcon className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearCurrentMessages}
            className="p-2 text-text-muted hover:text-rose-600 hover:bg-surface rounded-lg transition-colors"
            title="Clear Current Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            href="/agent"
            className="p-2 text-text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
            title="Expand Workspace"
          >
            <Maximize2 className="w-4 h-4" />
          </Link>
          <button
            onClick={() => toggleChat(false)}
            className="p-2 text-text-muted hover:text-foreground hover:bg-surface rounded-lg transition-colors"
            aria-label="Close Assistant Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {showHistory ? (
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-canvas">
          <div className="flex items-center justify-between border-b border-subtle pb-2 mb-3">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
              <HistoryIcon className="w-3.5 h-3.5 text-amber-primary" /> Past Sessions History
            </h4>
            <button
              onClick={handleStartNewThread}
              className="text-xs font-medium text-amber-primary hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New Session
            </button>
          </div>
          {sessions.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">
              No previous session history recorded.
            </p>
          ) : (
            sessions.map((sess) => (
              <button
                key={sess.thread_id}
                onClick={() => handleSelectSession(sess.thread_id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${sess.thread_id === activeThreadId
                    ? "bg-surface border-amber-primary text-amber-primary"
                    : "bg-canvas border-subtle hover:border-amber-primary text-text-muted"
                  }`}
              >
                <div className="font-semibold text-xs truncate">{sess.title || sess.thread_id}</div>
                <div className="text-[10px] text-text-muted font-mono mt-1">
                  {new Date(sess.created_at).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-canvas">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-text-muted">
              <div className="p-4 rounded-2xl bg-amber-surface border border-subtle mb-4 text-amber-primary">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                {siteConfig.brandName} Autonomous Intelligence
              </h4>
              <p className="text-xs text-text-muted max-w-[260px] mb-6">
                Ask about inventory ledgers, procurement orders, catalog pricing, or place orders via prompt.
              </p>
              <div className="w-full space-y-2">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left text-xs px-3 py-2 rounded-xl bg-surface border border-subtle hover:border-amber-primary text-text-muted hover:text-amber-primary transition-all duration-150"
                  >
                    &rarr; {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${msg.sender === "user"
                      ? "bg-amber-primary text-white"
                      : "bg-surface text-amber-primary border border-subtle"
                    }`}
                >
                  {msg.sender === "user" ? (
                    user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="User Avatar"
                        className="w-full h-full rounded-lg object-cover"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[78%] p-3 rounded-2xl leading-relaxed ${msg.sender === "user"
                      ? "bg-amber-primary text-white rounded-tr-none"
                      : "bg-surface border border-subtle text-foreground rounded-tl-none"
                    }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`block mt-1.5 text-[10px] font-mono text-right opacity-70 ${msg.sender === "user" ? "text-white" : "text-text-muted"}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <div className="w-7 h-7 rounded-lg bg-surface text-amber-primary flex items-center justify-center border border-subtle">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="px-3 py-2 rounded-xl bg-surface border border-subtle flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-primary" />
                <span>Analyzing procurement context...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-surface border-t border-subtle flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Instruct SS Agent..."
          className="flex-1 bg-canvas border border-subtle focus:border-amber-primary text-foreground placeholder-text-muted text-xs rounded-xl px-3 py-2.5 outline-none transition-colors"
          disabled={isLoading || showHistory}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim() || showHistory}
          className="p-2.5 rounded-xl bg-amber-primary hover:bg-amber-hover disabled:opacity-40 text-white transition-colors"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
