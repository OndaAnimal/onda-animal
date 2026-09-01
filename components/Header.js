"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { settings } = useSiteSettings();
  const close = () => setOpen(false);

  const links = [
    settings.showMenuHome && ["Início", "/"],
    settings.showMenuAnimals && ["Animais", "/adocao"],
    settings.showMenuHowAdopt && ["Como adotar", "/como-adotar"],
    settings.showMenuStories && settings.storiesEnabled && ["Histórias", "/historias"],
    settings.showMenuClinic && ["Clínica", "/servicos"],
    settings.showMenuContact && ["Contato", "/contato"],
    settings.showMenuFeedback && settings.feedbackEnabled && ["Avalie", "/avaliacao"],
  ].filter(Boolean);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {settings.announcementEnabled && (
        <div
          className="site-announcement"
          style={{
            background: settings.announcementBackground,
            color: settings.announcementTextColor,
          }}
        >
          <div className="container site-announcement-inner">
            <span>{settings.announcementText}</span>
            {settings.announcementButtonText && settings.announcementButtonLink && (
              <Link href={settings.announcementButtonLink}>
                {settings.announcementButtonText} →
              </Link>
            )}
          </div>
        </div>
      )}

      <header className="site-header" style={{ background: settings.headerBackground }}>
        <div className="container header-inner">
          <Link className="brand" href="/" aria-label={settings.siteName} onClick={close}>
            <img src={settings.logo || "/logo.png"} alt={settings.siteName} />
            <span className="brand-copy">
              <strong>{settings.siteName}</strong>
              <small>{settings.siteSubtitle}</small>
            </span>
          </Link>

          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            <span /><span /><span />
          </button>

          <nav className={open ? "main-nav open" : "main-nav"}>
            {links.map(([label, href]) => (
              <Link
                key={href}
                className={isActive(href) ? "active" : ""}
                href={href}
                onClick={close}
              >
                {label}
              </Link>
            ))}

            {settings.showAdoptButton && (
              <Link className="nav-cta" href="/adocao" onClick={close}>
                {settings.adoptButtonText}
              </Link>
            )}

            {settings.showAdminButton && (
              <Link className="nav-admin" href="/admin" onClick={close}>
                {settings.adminButtonText}
              </Link>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
