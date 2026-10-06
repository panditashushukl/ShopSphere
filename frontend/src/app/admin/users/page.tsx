"use client";

import { UserManagementTable } from "@/components/admin/UserManagementTable";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <UserManagementTable />
    </div>
  );
}
