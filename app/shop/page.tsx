import ShopContent from "@/components/shop/ShopContent";
import { getProducts, getBrands, getCategories } from "@/lib/data";

export const metadata = {
  title: "فروشگاه",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    bestSeller?: string;
    isNew?: string;
    onSale?: string;
  }>;
}) {
  const params = await searchParams;
  const products = getProducts();
  const brands = getBrands();
  const categories = getCategories();

  return (
    <ShopContent
      products={products}
      brands={brands}
      categories={categories}
      initialCategory={params.category ?? ""}
      initialBestSeller={params.bestSeller === "true"}
      initialIsNew={params.isNew === "true"}
      initialOnSale={params.onSale === "true"}
    />
  );
}
