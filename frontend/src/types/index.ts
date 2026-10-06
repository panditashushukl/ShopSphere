export interface ProductItem {
  id: number;
  sku: string;
  title: string;
  description?: string;
  stock: number;
  price?: number;
  min_order_quantity?: number;
  primary_image?: string;
  gallery_images?: string[];
  image_url?: string;
  retail_price?: number;
  trade_price?: number;
  wholesale_price?: number;
  is_active?: boolean;
}

export type UserRole = "CUSTOMER" | "RETAILER" | "WHOLESALER" | "SUPER_ADMIN";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product_title?: string;
  product_sku?: string;
}

export interface OrderRecord {
  id: number;
  order_number: string;
  user_id: number;
  total_amount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  payment_status: "UNPAID" | "PAID" | "REFUNDED";
  created_at: string;
  items?: OrderItem[];
}
