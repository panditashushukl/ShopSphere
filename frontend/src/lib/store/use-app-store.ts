import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AppState {
  // Chat Drawer & Session State
  isChatOpen: boolean;
  activeThreadId: string;
  messages: ChatMessage[];
  toggleChat: (open?: boolean) => void;
  setActiveThreadId: (threadId: string) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isChatOpen: false,
      activeThreadId: "session_default",
      messages: [],
      toggleChat: (open) => set({ isChatOpen: open !== undefined ? open : !get().isChatOpen }),
      setActiveThreadId: (activeThreadId) => set({ activeThreadId }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set({ messages: [...get().messages, message] }),
    }),
    {
      name: "shopsphere-agent-chat-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);
