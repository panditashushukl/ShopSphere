"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { RoleBadge } from "@/components/ui/RoleBadge";
import type { Role } from "@/store/auth-store";
import { Users, CheckCircle2, ShieldAlert, UserCheck, Loader2 } from "lucide-react";
import { useState } from "react";

interface UserRecord {
  id: number;
  email: string;
  role: Role;
  is_verified: boolean;
}

export function UserManagementTable() {
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: rawUsers, isLoading } = useQuery<UserRecord[]>({
    queryKey: ["admin-users"],
    queryFn: () => api<UserRecord[]>("/admin/users"),
    enabled: typeof window !== "undefined",
  });

  const users: UserRecord[] = Array.isArray(rawUsers) ? rawUsers : [];

  const updateUserMutation = useMutation({
    mutationFn: async ({ uid, role, is_verified }: { uid: number; role?: Role; is_verified?: boolean }) => {
      setUpdatingId(uid);
      const params = new URLSearchParams();
      if (role !== undefined) params.set("role", role);
      if (is_verified !== undefined) params.set("is_verified", String(is_verified));
      return api(`/admin/users/${uid}?${params.toString()}`, { method: "PATCH" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setUpdatingId(null);
    },
    onError: () => {
      setUpdatingId(null);
    },
  });

  return (
    <div className="bg-surface border border-subtle rounded-2xl overflow-hidden shadow-sm space-y-0">
      <div className="p-5 border-b border-subtle flex items-center justify-between bg-canvas">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-primary" /> Platform User Management & RBAC Permissions
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Approve pending B2B merchant accounts and update user security role assignments.
          </p>
        </div>
        <span className="text-xs font-semibold bg-amber-surface text-amber-primary border border-subtle px-2.5 py-1 rounded-full">
          {users.length} Registered Accounts
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-text-muted">
          <thead className="bg-canvas text-text-muted font-semibold uppercase text-[10px] border-b border-subtle">
            <tr>
              <th className="py-3.5 px-5">ID</th>
              <th className="py-3.5 px-5">User Email</th>
              <th className="py-3.5 px-5">Current Role</th>
              <th className="py-3.5 px-5 text-center">Account Status</th>
              <th className="py-3.5 px-5 text-center">Assign Role</th>
              <th className="py-3.5 px-5 text-right">Approval Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted">
                  Loading user records...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-text-muted">
                  No registered users found.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isWorking = updatingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-canvas transition-colors">
                    <td className="py-3.5 px-5 font-mono text-text-muted">#{u.id}</td>
                    <td className="py-3.5 px-5 font-bold text-foreground">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <RoleBadge role={u.role} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Verified Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-surface text-amber-primary border border-subtle px-2 py-0.5 rounded-full">
                          <ShieldAlert className="w-3 h-3" /> Pending Admin Approval
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <select
                        value={u.role}
                        disabled={isWorking}
                        onChange={(e) =>
                          updateUserMutation.mutate({ uid: u.id, role: e.target.value as Role })
                        }
                        className="bg-canvas border border-subtle rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-primary"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="RETAILER">RETAILER</option>
                        <option value="WHOLESALER">WHOLESALER</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {!u.is_verified ? (
                        <button
                          disabled={isWorking}
                          onClick={() =>
                            updateUserMutation.mutate({ uid: u.id, is_verified: true })
                          }
                          className="py-1 px-3 bg-amber-primary hover:bg-amber-hover text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          {isWorking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          Approve Account
                        </button>
                      ) : (
                        <button
                          disabled={isWorking}
                          onClick={() =>
                            updateUserMutation.mutate({ uid: u.id, is_verified: false })
                          }
                          className="py-1 px-2.5 bg-canvas hover:bg-surface text-text-muted rounded-lg text-[11px] font-medium transition-colors border border-subtle"
                        >
                          Revoke Verification
                        </button>
                      )}
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
