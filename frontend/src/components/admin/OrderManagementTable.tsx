"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";

interface SitewideOrder {
  id: number;
  user_id: number;
  order_type: "B2C" | "RETAILER" | "WHOLESALER";
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  created_at: string;
}

export function OrderManagementTable() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: rawOrders, isLoading } = useQuery<SitewideOrder[]>({
    queryKey: ["admin-orders"],
    queryFn: () => api<SitewideOrder[]>("/orders"),
    enabled: typeof window !== "undefined",
  });

  const orders: SitewideOrder[] = Array.isArray(rawOrders) ? rawOrders : [];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ oid, status }: { oid: number; status: string }) => {
      setUpdatingId(oid);
      return api(`/admin/orders/${oid}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      setUpdatingId(null);
    },
    onError: () => {
      setUpdatingId(null);
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "SHIPPED":
        return "default";
      case "PROCESSING":
        return "default";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-sm space-y-0">
      <div className="p-5 border-b border-subtle flex items-center justify-between bg-canvas">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-primary" /> Sitewide Order Fulfillment & Status Manager
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Transition order lifecycle states across B2C, Retailer, and Wholesaler accounts.
          </p>
        </div>
        <span className="text-xs font-semibold bg-amber-surface text-amber-primary border border-subtle px-2.5 py-1 rounded-full">
          {orders.length} Sitewide Orders
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-muted">
          <thead className="bg-canvas text-text-muted font-semibold uppercase text-[10px] border-b border-subtle">
            <tr>
              <th className="py-3.5 px-5">Order ID</th>
              <th className="py-3.5 px-5">User ID</th>
              <th className="py-3.5 px-5">Channel Type</th>
              <th className="py-3.5 px-5 text-right">Order Amount</th>
              <th className="py-3.5 px-5 text-center">Lifecycle Status</th>
              <th className="py-3.5 px-5 text-right">Transition Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted">
                  Loading order records...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted">
                  No orders recorded yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const isWorking = updatingId === o.id;

                return (
                  <tr key={o.id} className="hover:bg-canvas transition-colors">
                    <td className="py-3.5 px-5 font-mono text-text-muted font-bold">#ORD-{o.id}</td>
                    <td className="py-3.5 px-5 font-mono text-text-muted">User #{o.user_id}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-surface text-amber-primary border border-subtle"
                      >
                        {o.order_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-foreground">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <Badge variant={getStatusBadgeVariant(o.status)}>{o.status}</Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1">
                        {isWorking && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-primary mr-1" />}
                        <select
                          value={o.status}
                          disabled={isWorking}
                          onChange={(e) =>
                            updateStatusMutation.mutate({ oid: o.id, status: e.target.value })
                          }
                          className="bg-canvas border border-subtle rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-primary"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
