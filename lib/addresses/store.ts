import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export interface SavedAddress {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
  createdAt: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ADDRESSES_FILE = path.join(DATA_DIR, "addresses.json");

const ensureFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.readFile(ADDRESSES_FILE, "utf8").catch(() => fs.writeFile(ADDRESSES_FILE, "[]", "utf8"));
};

const readAddresses = async (): Promise<SavedAddress[]> => {
  await ensureFile();
  const raw = await fs.readFile(ADDRESSES_FILE, "utf8").catch(() => "[]");
  try {
    return JSON.parse(raw) as SavedAddress[];
  } catch {
    return [];
  }
};

const writeAddresses = async (addresses: SavedAddress[]) => {
  await ensureFile();
  await fs.writeFile(ADDRESSES_FILE, JSON.stringify(addresses, null, 2), "utf8");
};

export const getUserAddresses = async (userId: string): Promise<SavedAddress[]> => {
  const addresses = await readAddresses();
  return addresses
    .filter((a) => a.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const addAddress = async (
  userId: string,
  address: Omit<SavedAddress, "id" | "userId" | "createdAt">
): Promise<SavedAddress> => {
  const addresses = await readAddresses();
  const newAddress: SavedAddress = {
    ...address,
    id: crypto.randomUUID(),
    userId,
    createdAt: Date.now(),
  };
  addresses.push(newAddress);
  await writeAddresses(addresses);
  return newAddress;
};

export const updateAddress = async (
  addressId: string,
  userId: string,
  updates: Partial<Omit<SavedAddress, "id" | "userId" | "createdAt">>
): Promise<SavedAddress | null> => {
  const addresses = await readAddresses();
  const index = addresses.findIndex((a) => a.id === addressId && a.userId === userId);
  if (index === -1) return null;
  addresses[index] = { ...addresses[index], ...updates };
  await writeAddresses(addresses);
  return addresses[index];
};

export const deleteAddress = async (addressId: string, userId: string): Promise<boolean> => {
  const addresses = await readAddresses();
  const index = addresses.findIndex((a) => a.id === addressId && a.userId === userId);
  if (index === -1) return false;
  addresses.splice(index, 1);
  await writeAddresses(addresses);
  return true;
};