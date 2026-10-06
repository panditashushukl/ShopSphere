"use client";

import { OrderManagementTable } from "@/components/admin/OrderManagementTable";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <OrderManagementTable />
    </div>
  );
}
