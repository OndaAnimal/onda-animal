import "./globals.css";
import { DEFAULT_SITE_SETTINGS } from "../lib/localData";
import { getSiteData } from "../lib/serverStore";

export async function generateMetadata() {
  let settings = DEFAULT_SITE_SETTINGS;
  try {
    const stored = await getSiteData("settings", DEFAULT_SITE_SETTINGS);
    settings = { ...DEFAULT_SITE_SETTINGS, ...(stored || {}) };
  } catch {
    // O build local continua funcionando mesmo antes do DATABASE_URL ser configurado.
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const socialImage = String(settings.socialImage || "");
  const remoteSocialImage = /^https?:\/\//i.test(socialImage) ? socialImage : null;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: settings.seoTitle || DEFAULT_SITE_SETTINGS.seoTitle,
    description: settings.seoDescription || DEFAULT_SITE_SETTINGS.seoDescription,
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
    openGraph: {
      title: settings.seoTitle || DEFAULT_SITE_SETTINGS.seoTitle,
      description: settings.seoDescription || DEFAULT_SITE_SETTINGS.seoDescription,
      type: "website",
      ...(remoteSocialImage ? { images: [remoteSocialImage] } : {}),
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
