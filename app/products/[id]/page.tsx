import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import {
  getProductById,
  getProducts,
  getBrands,
  getCategories,
  getRelatedProducts,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type ProductGuarantee =
  | string
  | {
      name?: string;
      title?: string;
      description?: string;
      value?: string;
    }
  | null
  | undefined;

function getProductGuaranteeValue(
  product:
    | (Awaited<ReturnType<typeof getProductById>> & {
        guarantee?: ProductGuarantee;
        warranty?: ProductGuarantee;
      })
    | null
    | undefined
): string | null {
  if (!product) return null;

  const candidate = (product as { guarantee?: ProductGuarantee; warranty?: ProductGuarantee }).guarantee ??
    (product as { guarantee?: ProductGuarantee; warranty?: ProductGuarantee }).warranty;

  if (!candidate) return null;

  if (typeof candidate === "string") {
    return candidate.trim() || null;
  }

  const guaranteeText =
    candidate.name ?? candidate.title ?? candidate.description ?? candidate.value;

  if (typeof guaranteeText === "string") {
    return guaranteeText.trim() || null;
  }

  return null;
}

function getProductMetadata(product: NonNullable<Awaited<ReturnType<typeof getProductById>>>): Metadata {
  const safePrice = Number.isFinite(product.price) ? product.price : 0;
  const safeStock = Number.isFinite(product.stock) ? product.stock : 0;

  const rawImageUrl = Array.isArray(product.images)
    ? product.images.find((img) => typeof img === "string" && img.trim().length > 0) ?? ""
    : "";

  const isValidHttpUrl = (value: string) => {
    if (!value) return false;
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const imageUrl = isValidHttpUrl(rawImageUrl) ? rawImageUrl : "";
  const guaranteeValue = getProductGuaranteeValue(product);

  const productMeta: Record<string, string> = {
    product_price: String(safePrice),
    availability: safeStock > 0 ? "instock" : "outofstock",
    product_name: String(product.name ?? ""),
    product_id: String(product.id ?? ""),
  };

  if (guaranteeValue) {
    productMeta.guarantee = guaranteeValue;
  }

  return {
    title: product.name,
    description: product.description ?? "",
    other: productMeta,
    openGraph: {
      title: product.name,
      description: product.description ?? "",
      url: `/products/${product.id}`,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
    },
    alternates: {
      canonical: `/products/${product.id}`,
    },
  };
}

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((p) => ({
    id: String(p.id),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return { title: "محصول یافت نشد" };
  }

  return getProductMetadata(product);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const brands = getBrands();
  const categories = getCategories();
  const brand = brands.find((b) => b.id === product.brandId);
  const category = categories.find((c) => c.id === product.categoryId);
  const relatedProducts = getRelatedProducts(product);

  return (
    <ProductDetailsClient
      product={product}
      brand={brand}
      category={category}
      relatedProducts={relatedProducts}
    />
  );
}