import type { Role } from "@/store/auth-store";
import { Shield, Building2, Store, UserCheck } from "lucide-react";

interface RoleBadgeProps {
  role?: Role | null;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function RoleBadge({ role = "CUSTOMER", showIcon = true, size = "md" }: RoleBadgeProps) {
  if (!role) role = "CUSTOMER";

  const config: Record<Role, { label: string; bg: string; text: string; border: string; icon: any }> = {
    SUPER_ADMIN: {
      label: "Admin",
      bg: "bg-amber-surface",
      text: "text-amber-primary",
      border: "border-subtle",
      icon: Shield,
    },
    WHOLESALER: {
      label: "Wholesaler",
      bg: "bg-amber-surface",
      text: "text-amber-primary",
      border: "border-subtle",
      icon: Building2,
    },
    RETAILER: {
      label: "Retailer",
      bg: "bg-amber-surface",
      text: "text-amber-primary",
      border: "border-subtle",
      icon: Store,
    },
    CUSTOMER: {
      label: "Customer",
      bg: "bg-surface",
      text: "text-text-muted",
      border: "border-subtle",
      icon: UserCheck,
    },
  };

  const item = config[role] ?? config.CUSTOMER;
  const Icon = item.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${item.bg} ${item.text} ${item.border} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{item.label}</span>
    </span>
  );
}
