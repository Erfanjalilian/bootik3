export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  status: "pending" | "paid" | "failed" | "cancelled";
  trackId?: number;
  refNumber?: number;
  createdAt: number;
  paidAt?: number;
}