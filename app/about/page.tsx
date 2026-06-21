import AboutContent from "@/components/about/AboutContent";
import { getSettings } from "@/lib/data";

export const metadata = {
  title: "درباره ما",
};

export default function AboutPage() {
  const settings = getSettings();
  return <AboutContent settings={settings} />;
}
