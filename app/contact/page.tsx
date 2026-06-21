import ContactContent from "@/components/contact/ContactContent";
import { getSettings } from "@/lib/data";

export const metadata = {
  title: "تماس با ما",
};

export default function ContactPage() {
  const settings = getSettings();
  return <ContactContent settings={settings} />;
}
