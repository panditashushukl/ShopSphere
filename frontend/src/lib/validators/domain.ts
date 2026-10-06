import { z } from "zod";

export const UserRoleSchema = z.enum(["SUPER_ADMIN", "WHOLESALER", "RETAILER", "CUSTOMER"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  fullName: z.string().min(1),
  role: UserRoleSchema,
  avatarUrl: z.string().url().nullable().optional(),
  isVerified: z.boolean(),
  createdAt: z.string().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const ProductImagesSchema = z.object({
  primary: z.string().url(),
  gallery: z.array(z.string().url()).default([]),
});
export type ProductImages = z.infer<typeof ProductImagesSchema>;

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  sku: z.string().min(2),
  title: z.string().min(1),
  description: z.string().default(""),
  stock: z.number().int().nonnegative(),
  price: z.number().positive().optional(),
  retailPrice: z.number().positive().optional(),
  tradePrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  minOrderQuantity: z.number().int().positive().optional(),
  images: ProductImagesSchema,
  createdAt: z.string().optional(),
});
export type Product = z.infer<typeof ProductSchema>;

export const OrderStatusSchema = z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderTypeSchema = z.enum(["B2C", "RETAILER", "WHOLESALER"]);
export type OrderType = z.infer<typeof OrderTypeSchema>;

export const OrderItemSchema = z.object({
  id: z.number().int().positive(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  orderType: OrderTypeSchema,
  status: OrderStatusSchema,
  total: z.number().nonnegative(),
  createdAt: z.string(),
  items: z.array(OrderItemSchema).optional(),
});
export type Order = z.infer<typeof OrderSchema>;

export const AgentMessageSchema = z.object({
  id: z.string(),
  threadId: z.string(),
  sender: z.enum(["user", "agent", "system"]),
  text: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});
export type AgentMessage = z.infer<typeof AgentMessageSchema>;

export const AgentSessionSchema = z.object({
  threadId: z.string(),
  userId: z.string(),
  title: z.string(),
  createdAt: z.string(),
});
export type AgentSession = z.infer<typeof AgentSessionSchema>;
