export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  brandId: string;
  categoryId: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  specifications: Record<string, string>;
  isBestSeller: boolean;
  isNew: boolean;
  isOnSale: boolean;
  stock: number;
  rating: number;
  weight?: number; // وزن به گرم
  length?: number; // طول به سانتی‌متر
  width?: number;  // عرض به سانتی‌متر
  height?: number; // ارتفاع به سانتی‌متر
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  type: "hero" | "ad";
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  phone: string;
  landline: string;
  address: string;
  email: string;
  about: {
    title: string;
    subtitle: string;
    story: string;
    values: { title: string; description: string; icon: string }[];
    stats: { label: string; value: string }[];
  };
  social: {
    instagram: string;
    telegram: string;
    whatsapp: string;
  };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}
