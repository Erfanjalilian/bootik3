'use client';

import { useEffect, useState } from 'react';
import SimpleBanner from '@/components/home/SimpleBanner';
import AdBanners from '@/components/home/AdBanners';
import type { Banner } from '@/lib/types';

interface BannerSectionProps {
  initialHeroBanners: Banner[];
  initialAdBanners: Banner[];
}

export function BannerSection({ initialHeroBanners, initialAdBanners }: BannerSectionProps) {
  const [heroBanners, setHeroBanners] = useState(initialHeroBanners);
  const [adBanners, setAdBanners] = useState(initialAdBanners);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/admin/banners');
        if (response.ok) {
          const allBanners: Banner[] = await response.json();
          setHeroBanners(allBanners.filter((b) => b.type === 'hero'));
          setAdBanners(allBanners.filter((b) => b.type === 'ad'));
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        // Use initial banners if fetch fails
      }
    };

    fetchBanners();
  }, []);

  return (
    <>
      {heroBanners.length > 0 && <SimpleBanner banner={heroBanners[0]} />}
      <AdBanners banners={adBanners} />
    </>
  );
}
