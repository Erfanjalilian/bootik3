import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Order } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

const ensureFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.readFile(ORDERS_FILE, "utf8").catch(() => fs.writeFile(ORDERS_FILE, "[]", "utf8"));
};

const readOrders = async (): Promise<Order[]> => {
  await ensureFile();
  const raw = await fs.readFile(ORDERS_FILE, "utf8").catch(() => "[]");
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
};

const writeOrders = async (orders: Order[]) => {
  await ensureFile();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8");
};

export const getAllOrders = async (): Promise<Order[]> => {
  const orders = await readOrders();
  return orders.sort((a, b) => b.createdAt - a.createdAt);
};

export const createOrder = async (order: Omit<Order, "id" | "createdAt" | "status" | "shipping"> & { shipping: Order["shipping"] }): Promise<Order> => {
  const orders = await readOrders();
  const newOrder: Order = {
    ...order,
    id: crypto.randomUUID(),
    status: "pending",
    createdAt: Date.now(),
  };
  orders.push(newOrder);
  await writeOrders(orders);
  return newOrder;
};

export const getOrderById = async (id: string): Promise<Order | null> => {
  const orders = await readOrders();
  return orders.find((o) => o.id === id) ?? null;
};

export const getOrderByTrackId = async (trackId: number): Promise<Order | null> => {
  const orders = await readOrders();
  return orders.find((o) => o.trackId === trackId) ?? null;
};

export const updateOrderStatus = async (
  id: string,
  status: Order["status"],
  paymentInfo?: { trackId: number; refNumber: number }
): Promise<Order | null> => {
  const orders = await readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    status,
    ...(paymentInfo && { trackId: paymentInfo.trackId, refNumber: paymentInfo.refNumber }),
    ...(status === "paid" && { paidAt: Date.now() }),
  };
  await writeOrders(orders);
  return orders[index];
};

export const updateOrderTrackId = async (id: string, trackId: number): Promise<Order | null> => {
  const orders = await readOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  orders[index].trackId = trackId;
  await writeOrders(orders);
  return orders[index];
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const orders = await readOrders();
  return orders.filter((o) => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
};