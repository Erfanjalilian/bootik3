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
  // اصلاح: تبدیل id به string برای مقایسه
  return getProducts().find((p) => String(p.id) === id);
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
  const settings = readJson<Partial<SiteSettings>>("settings.json");
  return {
    ...settings,
    logoUrl: settings.logoUrl || "",
    about: {
      title: settings.about?.title || "داستان ما",
      subtitle: settings.about?.subtitle || "",
      story: settings.about?.story || "",
      mission: settings.about?.mission || "",
      vision: settings.about?.vision || "",
      enabled: {
        title: settings.about?.enabled?.title ?? true,
        subtitle: settings.about?.enabled?.subtitle ?? true,
        story: settings.about?.enabled?.story ?? true,
        mission: settings.about?.enabled?.mission ?? true,
        vision: settings.about?.enabled?.vision ?? true,
        values: settings.about?.enabled?.values ?? true,
        stats: settings.about?.enabled?.stats ?? true,
      },
      values: settings.about?.values || [],
      stats: settings.about?.stats || [],
    },
    contact: {
      title: settings.contact?.title || "تماس با ما",
      description: settings.contact?.description || "",
      workingHours: settings.contact?.workingHours || "شنبه تا پنج‌شنبه — ۹ صبح تا ۹ شب",
      enabled: {
        title: settings.contact?.enabled?.title ?? true,
        description: settings.contact?.enabled?.description ?? true,
        phone: settings.contact?.enabled?.phone ?? true,
        landline: settings.contact?.enabled?.landline ?? true,
        email: settings.contact?.enabled?.email ?? true,
        address: settings.contact?.enabled?.address ?? true,
        workingHours: settings.contact?.enabled?.workingHours ?? true,
      },
    },
  } as SiteSettings;
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