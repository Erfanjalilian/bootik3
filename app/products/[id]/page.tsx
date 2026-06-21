import { notFound } from "next/navigation";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import {
  getProductById,
  getProducts,
  getBrands,
  getCategories,
  getRelatedProducts,
} from "@/lib/data";

export async function generateStaticParams() {
  const products = getProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) return { title: "محصول یافت نشد" };
  return { title: product.name, description: product.description };
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
