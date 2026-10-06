import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User, Product } from "@/lib/validators/domain";

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Cart State
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, priceOverride?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;

  // Chat Drawer State
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
      // Auth Implementation
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false, cart: [] }),

      // Cart Implementation
      cart: [],
      addToCart: (product, quantity, priceOverride) => {
        const currentCart = get().cart;
        const existingIndex = currentCart.findIndex((item) => item.product.id === product.id);
        const unitPrice = priceOverride ?? product.price ?? product.retailPrice ?? 0;

        if (existingIndex > -1) {
          const updated = [...currentCart];
          updated[existingIndex].quantity += quantity;
          set({ cart: updated });
        } else {
          set({ cart: [...currentCart, { product, quantity, unitPrice }] });
        }
      },
      removeFromCart: (productId) =>
        set({ cart: get().cart.filter((item) => item.product.id !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ cart: [] }),

      // Chat Drawer Implementation
      isChatOpen: false,
      activeThreadId: "session_default",
      messages: [],
      toggleChat: (open) => set({ isChatOpen: open !== undefined ? open : !get().isChatOpen }),
      setActiveThreadId: (activeThreadId) => set({ activeThreadId }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) => set({ messages: [...get().messages, message] }),
    }),
    {
      name: "apex-commerce-app-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        cart: state.cart,
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);
