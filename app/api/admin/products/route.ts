import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Brand, Product } from "@/lib/types";
import { getProducts } from "@/lib/data";
import { revalidatePath } from "next/cache";

const dataDir = path.join(process.cwd(), "data");
const productsFile = path.join(dataDir, "products.json");
const brandsFile = path.join(dataDir, "brands.json");

async function readProducts(): Promise<Product[]> {
  const content = await fs.readFile(productsFile, "utf-8");
  return JSON.parse(content);
}

async function writeProducts(products: Product[]): Promise<void> {
  await fs.writeFile(productsFile, JSON.stringify(products, null, 2), "utf-8");
}

async function readBrands(): Promise<Brand[]> {
  const content = await fs.readFile(brandsFile, "utf-8");
  return JSON.parse(content);
}

async function writeBrands(brands: Brand[]): Promise<void> {
  await fs.writeFile(brandsFile, JSON.stringify(brands, null, 2), "utf-8");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeSpecifications(value: unknown): Record<string, string> {
  if (!value) return {};

  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, itemValue]) => [key, String(itemValue)])
    );
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.fromEntries(
          Object.entries(parsed as Record<string, unknown>).map(([key, itemValue]) => [key, String(itemValue)])
        );
      }
    } catch {
      return {};
    }
  }

  return {};
}

async function getOrCreateBrandId(body: Record<string, any>): Promise<string> {
  const brandName = typeof body.brandName === "string" ? body.brandName.trim() : "";
  if (!brandName) return body.brandId || "";

  const brands = await readBrands();
  const existingBrand = brands.find(
    (brand) => brand.name.trim().toLowerCase() === brandName.toLowerCase()
  );

  if (existingBrand) return existingBrand.id;

  const newBrand: Brand = {
    id: `brand-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: brandName,
    slug: slugify(brandName),
    logo: "",
  };

  brands.push(newBrand);
  await writeBrands(brands);
  return newBrand.id;
}

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error reading products:", error);
    return NextResponse.json(
      { error: "Failed to read products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const products = await readProducts();
    const brandId = await getOrCreateBrandId(body);

    const newProduct: Product = {
      id: String(Date.now()),
      name: body.name,
      description: body.description,
      price: body.price,
      originalPrice: body.originalPrice,
      discount: body.discount,
      brandId,
      categoryId: body.categoryId,
      images: body.images || [],
      colors: body.colors || [],
      sizes: body.sizes || [],
      specifications: normalizeSpecifications(body.specifications),
      isBestSeller: body.isBestSeller || false,
      isNew: body.isNew || false,
      isOnSale: body.isOnSale || false,
      stock: body.stock || 0,
      rating: body.rating || 0,
    };

    products.push(newProduct);
    await writeProducts(products);

    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/api/admin/products");

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const products = await readProducts();
    const index = products.findIndex((p) => p.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const brandId = await getOrCreateBrandId(body);

    const updatedProduct: Product = {
      id: products[index].id,
      name: body.name !== undefined ? body.name : products[index].name,
      description: body.description !== undefined ? body.description : products[index].description,
      price: typeof body.price === "number" ? body.price : products[index].price,
      originalPrice: body.originalPrice !== undefined ? body.originalPrice : products[index].originalPrice,
      discount: body.discount !== undefined ? body.discount : products[index].discount,
      brandId,
      categoryId: body.categoryId !== undefined ? body.categoryId : products[index].categoryId,
      images: Array.isArray(body.images) ? body.images : products[index].images || [],
      colors: Array.isArray(body.colors) ? body.colors : products[index].colors || [],
      sizes: Array.isArray(body.sizes) ? body.sizes : products[index].sizes || [],
      specifications: normalizeSpecifications(body.specifications !== undefined ? body.specifications : products[index].specifications),
      isBestSeller: typeof body.isBestSeller === "boolean" ? body.isBestSeller : products[index].isBestSeller,
      isNew: typeof body.isNew === "boolean" ? body.isNew : products[index].isNew,
      isOnSale: typeof body.isOnSale === "boolean" ? body.isOnSale : products[index].isOnSale,
      stock: typeof body.stock === "number" ? body.stock : products[index].stock,
      rating: typeof body.rating === "number" ? body.rating : products[index].rating,
    };

    products[index] = updatedProduct;
    await writeProducts(products);

    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/api/admin/products");

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const products = await readProducts();
    const filteredProducts = products.filter((p) => p.id !== id);

    if (filteredProducts.length === products.length) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    await writeProducts(filteredProducts);

    revalidatePath("/shop");
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/api/admin/products");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
