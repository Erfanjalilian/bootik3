import fs from "fs";
import path from "path";
import type { Banner, Brand, Category, Product, SiteSettings } from "./types";

const dataDir = path.join(process.cwd(), "data");

function readJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getProducts(): Product[] {
  return readJson<Product[]>("products.json");
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

export function getCategories(): Category[] {
  return readJson<Category[]>("categories.json");
}

export function getBrands(): Brand[] {
  return readJson<Brand[]>("brands.json");
}

export function getBanners(): Banner[] {
  return readJson<Banner[]>("banners.json");
}

export function getSettings(): SiteSettings {
  return readJson<SiteSettings>("settings.json");
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return getProducts()
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.categoryId === product.categoryId || p.brandId === product.brandId)
    )
    .slice(0, limit);
}
