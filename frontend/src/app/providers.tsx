"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/store/auth-store";
import { useCart } from "@/store/cart-store";
import { api } from "@/lib/api-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const setUser = useAuth((s) => s.setUser);

  useEffect(() => {
    // Synchronize auth state and cart with backend on mount
    api<{ id: number; email: string; full_name: string; role: any; is_verified: boolean }>("/auth/me")
      .then((user) => {
        setUser(user);
        useCart.getState().fetchCart();
      })
      .catch(() => {
        setUser(null);
      });
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
