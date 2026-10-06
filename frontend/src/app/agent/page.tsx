"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { api } from "@/lib/api-client";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { siteConfig } from "@/config/site.config";
import {
  Layers, Send, User, Sparkles, Trash2, RefreshCw, Plus, History,
  ArrowRight, ShoppingCart, ShoppingBag, AlertCircle, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { MarkdownRenderer } from "@/components/agent/markdown-renderer";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface Session {
  thread_id: string;
  user_id: string;
  title: string;
  created_at: string;
}

function AgentContent() {
  const user = useAuth((s) => s.user);
  const cartLines = useCart((s) => s.lines);
  const addCart = useCart((s) => s.add);
  const clearCart = useCart((s) => s.clear);

  const [activeSessionId, setActiveSessionId] = useState<string>("session_default");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const loadSessions = async () => {
      try {
        const fetchedSessions = await api<Session[]>(`${siteConfig.api.endpoints.agent.sessions}?user_id=${user?.id || "guest"}`);
        if (fetchedSessions && fetchedSessions.length > 0) {
          setSessions(fetchedSessions);
          setActiveSessionId(fetchedSessions[0].thread_id);
        } else {
          const defSess: Session = {
            thread_id: "session_default",
            user_id: String(user?.id || "guest"),
            title: "Default Session",
            created_at: new Date().toISOString()
          };
          setSessions([defSess]);
          setActiveSessionId("session_default");
        }
      } catch (err) {
        console.error("Failed to fetch persistent sessions:", err);
      }
    };
    loadSessions();
  }, [user]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!activeSessionId) return;
      try {
        const history = await api<Message[]>(siteConfig.api.endpoints.agent.history(activeSessionId));
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          setMessages([
            {
              id: `welcome-${Date.now()}`,
              sender: "agent",
              text: `Welcome ${user?.full_name || "Guest"}! I am your SS Agent. How can I support your catalog browsing or order execution today?`,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              metadata: { status: "Ready", role: user?.role || "GUEST" }
            }
          ]);
        }
        scrollToBottom(false);
      } catch (err) {
        console.error("Failed to load message history:", err);
      }
    };
    loadHistory();
  }, [activeSessionId, user]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loading]);

  const handleCreateNewSession = async () => {
    try {
      setLoading(true);
      const newSession = await api<Session>(siteConfig.api.endpoints.agent.sessions, {
        method: "POST",
        body: JSON.stringify({
          title: `Procurement Session ${sessions.length + 1}`
        })
      });

      if (newSession && newSession.thread_id) {
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession.thread_id);
        setMessages([
          {
            id: `welcome-${Date.now()}`,
            sender: "agent",
            text: "New procurement thread initialized. Ready for instructions.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
        ]);
        scrollToBottom(true);
      }
    } catch (err) {
      const localThreadId = `session_${Date.now()}`;
      const fallbackSession: Session = {
        thread_id: localThreadId,
        user_id: String(user?.id || "guest"),
        title: `Procurement Session ${sessions.length + 1}`,
        created_at: new Date().toISOString()
      };
      setSessions((prev) => [fallbackSession, ...prev]);
      setActiveSessionId(localThreadId);
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          sender: "agent",
          text: "New Chat initialized. Ready for catalog queries and order execution.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
      ]);
      scrollToBottom(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (promptToSend?: string) => {
    const textQuery = (promptToSend || input).trim();
    if (!textQuery || loading) return;

    // Dynamically update active session title if generic
    const titleSnippet = textQuery.length > 30 ? textQuery.slice(0, 30) + "..." : textQuery;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.thread_id === activeSessionId) {
          if (!s.title || s.title === "Default Session" || s.title === "New Session" || s.title === "New Chat" || s.title.startsWith("Procurement Session")) {
            return { ...s, title: titleSnippet };
          }
        }
        return s;
      })
    );

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInput("");
    setLoading(true);
    scrollToBottom(true);

    try {
      const res = await api<{ reply: string; status: string; thread_id?: string; metadata?: Record<string, any> }>(
        siteConfig.api.endpoints.agent.query,
        {
          method: "POST",
          body: JSON.stringify({
            message: textQuery,
            thread_id: activeSessionId,
          }),
        }
      );

      if (res.metadata?.action === "ADD_TO_CART" && res.metadata?.cart_item) {
        const item = res.metadata.cart_item;
        addCart(
          {
            productId: item.productId,
            sku: item.sku,
            title: item.title,
            price: item.price,
            moq: item.moq || 1,
          },
          item.qty || 1
        );
      }

      if (res.metadata?.action === "CLEAR_CART") {
        clearCart();
      }

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: res.reply || "SS Agent completed your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metadata: res.metadata,
      };

      setMessages((prev) => [...prev, agentMsg]);
      scrollToBottom(true);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        sender: "agent",
        text: `Execution Error: ${err.message || "Request processing failed."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        metadata: { status: "error" }
      };
      setMessages((prev) => [...prev, errorMsg]);
      scrollToBottom(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "agent",
        text: `View cleared. Ready for your next query, ${user?.full_name || "Guest"}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
    ]);
    scrollToBottom(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-primary flex items-center justify-center text-white shadow-sm">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground tracking-tight">SS Agent</h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-surface text-amber-primary border border-subtle px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-amber-primary" /> Online
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Staged Cart Items: <span className="text-amber-primary font-bold">{cartLines.reduce((a, c) => a + c.qty, 0)} units</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
          {sessions.length > 0 && (
            <div className="relative" ref={historyRef}>
              <button
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  showHistoryDropdown
                    ? "bg-amber-surface border-amber-primary text-amber-primary"
                    : "bg-canvas border-subtle text-foreground hover:border-amber-primary"
                }`}
                title="View Chat History"
              >
                <History className="w-3.5 h-3.5 text-amber-primary" />
                <span>History</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showHistoryDropdown ? "rotate-180 text-amber-primary" : "text-text-muted"}`} />
              </button>

              {showHistoryDropdown && (
                <div className="absolute right-0 mt-2 w-64 max-h-72 overflow-y-auto bg-surface border border-subtle rounded-2xl shadow-xl z-50 p-2 space-y-1">
                  <div className="text-[11px] font-bold text-text-muted px-2 py-1 uppercase tracking-wider border-b border-subtle mb-1 flex items-center justify-between">
                    <span>Chat History</span>
                    <span className="text-[10px] font-normal font-mono">{sessions.length} chats</span>
                  </div>
                  {sessions.map((sess) => (
                    <button
                      key={sess.thread_id}
                      onClick={() => {
                        setActiveSessionId(sess.thread_id);
                        setShowHistoryDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-all ${
                        sess.thread_id === activeSessionId
                          ? "bg-amber-surface text-amber-primary font-bold border border-subtle"
                          : "text-foreground hover:bg-canvas hover:text-amber-primary"
                      }`}
                    >
                      <span className="truncate">{sess.title || "Untitled Session"}</span>
                      <span className="text-[10px] text-text-muted font-mono">
                        {sess.created_at ? new Date(sess.created_at).toLocaleDateString() : ""}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCreateNewSession}
            disabled={loading}
            className="px-3 py-2 bg-amber-primary hover:bg-amber-hover text-white active:scale-95 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all border border-subtle"
            title="Create New Chat Thread"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <RoleBadge role={user.role} size="sm" />
            </div>
          ) : (
            <Link
              href="/login?next=/agent"
              className="text-xs font-semibold text-amber-primary hover:underline flex items-center gap-1"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            onClick={clearChat}
            className="p-2 text-text-muted hover:text-rose-600 hover:bg-rose-500/10 rounded-xl transition-colors border border-subtle"
            title="Clear Current View"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-surface border border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[560px]">
        <div
          ref={chatContainerRef}
          className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2 scroll-smooth"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.sender === "user"
                  ? "bg-amber-primary text-white"
                  : "bg-amber-surface text-amber-primary border border-subtle"
                  }`}
              >
                {msg.sender === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Layers className="w-4 h-4 text-amber-primary" />
                )}
              </div>

              <div className={`space-y-1.5 max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.sender === "user"
                    ? "bg-amber-primary text-white shadow-sm rounded-tr-none"
                    : "bg-canvas border border-subtle text-foreground rounded-tl-none"
                    }`}
                >
                  <MarkdownRenderer content={msg.text} isUser={msg.sender === "user"} />
                </div>

                <div className={`flex flex-wrap items-center gap-2 text-[10px] text-text-muted ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <span>{msg.timestamp}</span>

                  {msg.metadata?.action === "ADD_TO_CART" && (
                    <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" /> Live Cart Updated
                    </span>
                  )}

                  {msg.metadata?.action === "CLEAR_CART" && (
                    <span className="bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> Order Placed & Cart Cleared
                    </span>
                  )}

                  {msg.metadata?.action === "PREVIEW_ORDER" && (
                    <span className="bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Confirmation Awaited
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-primary text-white flex items-center justify-center animate-pulse">
                <Layers className="w-4 h-4" />
              </div>
              <div className="p-3 bg-canvas border border-subtle rounded-2xl rounded-tl-none text-xs text-text-muted flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-primary" />
                <span>SS Agent is typing...</span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-subtle space-y-3">
          <div className="flex items-center gap-3 bg-canvas border border-subtle rounded-2xl p-2 focus-within:ring-2 focus-within:ring-amber-primary/40">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Instruct SS Agent to search catalog, update stock, or execute checkout..."
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-foreground placeholder-text-muted focus:outline-none resize-none px-2 py-1"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className={`p-2.5 rounded-xl text-white transition-all ${loading || !input.trim()
                ? "bg-subtle text-text-muted cursor-not-allowed"
                : "bg-amber-primary hover:bg-amber-hover shadow-sm active:scale-95"
                }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentPage() {
  return (
    <Suspense fallback={<div className="text-text-muted py-10 text-center">Loading SS Agent Workspace...</div>}>
      <AgentContent />
    </Suspense>
  );
}
