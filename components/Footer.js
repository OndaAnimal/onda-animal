"use client";

import Link from "next/link";
import { useSiteSettings } from "./SiteSettingsProvider";
import { mediaUrl } from "../lib/mediaUrl";

export default function Footer() {
  const { settings } = useSiteSettings();

  const links = [
    settings.footerShowAnimals && ["Animais", "/adocao"],
    settings.footerShowHowAdopt && ["Como adotar", "/como-adotar"],
    settings.footerShowVeterinarians && ["Veterinários", "/veterinarios"],
    settings.footerShowFeedback && settings.feedbackEnabled && ["Avalie o site", "/avaliacao"],
    settings.footerShowContact && ["Contato", "/contato"],
  ].filter(Boolean);

  const developerName = settings.footerDeveloperName || "Forge Labs";
  const developerUrl = String(settings.footerDeveloperUrl || "").trim();

  return (
    <footer className="site-footer" style={{ background: settings.footerBackground }}>
      <div className="container footer-grid footer-grid-v4">
        <Link className="footer-brand" href="/">
          <img
            src={mediaUrl(settings.logo || "/logo.png", { width: 140 })}
            alt={settings.siteName}
            loading="lazy"
            decoding="async"
          />
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
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>{settings.footerText}</p>

          {settings.footerShowDeveloperCredit !== false && (
            <div className="footer-developer-credit">
              <span className="footer-developer-mark" aria-hidden="true">◆</span>
              <span>{settings.footerDeveloperPrefix || "Desenvolvido por"}</span>
              {developerUrl ? (
                <a href={developerUrl} target="_blank" rel="noreferrer">
                  {developerName}
                </a>
              ) : (
                <strong>{developerName}</strong>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
