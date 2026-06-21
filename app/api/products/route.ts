import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const search = searchParams.get("search");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bestSeller = searchParams.get("bestSeller");
  const isNew = searchParams.get("isNew");
  const onSale = searchParams.get("onSale");

  let products = getProducts();

  if (category) {
    products = products.filter((p) => p.categoryId === category);
  }
  if (brand) {
    products = products.filter((p) => p.brandId === brand);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  if (minPrice) {
    products = products.filter((p) => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.price <= Number(maxPrice));
  }
  if (bestSeller === "true") {
    products = products.filter((p) => p.isBestSeller);
  }
  if (isNew === "true") {
    products = products.filter((p) => p.isNew);
  }
  if (onSale === "true") {
    products = products.filter((p) => p.isOnSale);
  }

  return NextResponse.json(products);
}
