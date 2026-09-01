"use client";

import Link from "next/link";
import { useSiteSettings } from "./SiteSettingsProvider";
import { mediaUrl } from "../lib/mediaUrl";

export default function Footer() {
  const { settings } = useSiteSettings();

  const links = [
    settings.footerShowAnimals && ["Animais", "/adocao"],
    settings.footerShowHowAdopt && ["Como adotar", "/como-adotar"],
    settings.footerShowFeedback && settings.feedbackEnabled && ["Avalie o site", "/avaliacao"],
    settings.footerShowContact && ["Contato", "/contato"],
  ].filter(Boolean);

  return (
    <footer style={{ background: settings.footerBackground }}>
      <div className="container footer-grid footer-grid-v4">
        <Link className="footer-brand" href="/">
          <img src={mediaUrl(settings.logo || "/logo.png", { width: 140 })} alt={settings.siteName} loading="lazy" decoding="async" />
          <div>
            <strong>{settings.siteName}</strong>
            <small>{settings.siteSubtitle}</small>
          </div>
        </Link>

        <div className="footer-links-v4">
          {links.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </div>

        <p>{settings.footerText}</p>
      </div>
    </footer>
  );
}
