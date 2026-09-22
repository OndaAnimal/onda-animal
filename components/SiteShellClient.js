"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ForgeConnectWidget from "./ForgeConnectWidget";
import { useSiteSettings } from "./SiteSettingsProvider";
import { mediaUrl } from "../lib/mediaUrl";

function shouldOpenNotice(settings) {
  if (!settings.noticeModalEnabled || typeof window === "undefined") return false;

  const frequency = settings.noticeModalFrequency || "session";
  const campaign = settings.noticeModalCampaignId || "aviso-1";
  const baseKey = `onda_notice_${campaign}`;

  if (frequency === "always") return true;

  if (frequency === "session") {
    return sessionStorage.getItem(baseKey) !== "seen";
  }

  if (frequency === "daily") {
    const today = new Date().toISOString().slice(0, 10);
    return localStorage.getItem(baseKey) !== today;
  }

  if (frequency === "campaign") {
    return localStorage.getItem(baseKey) !== "seen";
  }

  return true;
}

function markNoticeSeen(settings) {
  if (typeof window === "undefined") return;

  const frequency = settings.noticeModalFrequency || "session";
  const campaign = settings.noticeModalCampaignId || "aviso-1";
  const baseKey = `onda_notice_${campaign}`;

  if (frequency === "session") {
    sessionStorage.setItem(baseKey, "seen");
  } else if (frequency === "daily") {
    localStorage.setItem(baseKey, new Date().toISOString().slice(0, 10));
  } else if (frequency === "campaign") {
    localStorage.setItem(baseKey, "seen");
  }
}

export default function SiteShellClient({ children }) {
  const { settings } = useSiteSettings();
  const [noticeOpen, setNoticeOpen] = useState(false);

  useEffect(() => {
    if (!settings.noticeModalEnabled) {
      setNoticeOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      if (shouldOpenNotice(settings)) setNoticeOpen(true);
    }, 650);

    return () => clearTimeout(timer);
  }, [
    settings.noticeModalEnabled,
    settings.noticeModalFrequency,
    settings.noticeModalCampaignId,
  ]);

  useEffect(() => {
    if (!noticeOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") closeNotice();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [noticeOpen]);

  function closeNotice() {
    markNoticeSeen(settings);
    setNoticeOpen(false);
  }

  if (settings.maintenanceEnabled) {
    return (
      <main className="maintenance-page">
        <div className="maintenance-card">
          <img
            src={mediaUrl(settings.logo || "/logo.png", { width: 180 })}
            alt={settings.siteName}
            fetchPriority="high"
            decoding="async"
          />
          <span>{settings.siteName}</span>
          <h1>{settings.maintenanceTitle}</h1>
          <p>{settings.maintenanceText}</p>
          {settings.phone1 && <a href={`tel:${settings.phone1Raw || ""}`}>{settings.phone1}</a>}
        </div>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main>{children}</main>

      {noticeOpen && (
        <div
          className="site-notice-modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeNotice();
          }}
        >
          <article
            className={settings.noticeModalImage ? "site-notice-modal has-image" : "site-notice-modal"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="site-notice-title"
          >
            <button
              type="button"
              className="site-notice-close"
              onClick={closeNotice}
              aria-label="Fechar aviso"
            >
              ×
            </button>

            {settings.noticeModalImage && (
              <div className="site-notice-image">
                <img
                  src={mediaUrl(settings.noticeModalImage, { width: 1000, height: 720, crop: "fill" })}
                  alt=""
                />
              </div>
            )}

            <div className="site-notice-content">
              <span className="site-notice-eyebrow">
                <i>!</i>
                {settings.noticeModalEyebrow}
              </span>
              <h2 id="site-notice-title">{settings.noticeModalTitle}</h2>
              <p>{settings.noticeModalText}</p>

              <div className="site-notice-actions">
                {settings.noticeModalButtonText && settings.noticeModalButtonLink && (
                  <Link
                    className="button primary"
                    href={settings.noticeModalButtonLink}
                    onClick={closeNotice}
                  >
                    {settings.noticeModalButtonText}
                  </Link>
                )}
                <button type="button" className="site-notice-dismiss" onClick={closeNotice}>
                  Continuar no site
                </button>
              </div>

              <small>Onda Animal • Informação oficial do site</small>
            </div>
          </article>
        </div>
      )}

      {settings.feedbackEnabled && settings.floatingFeedbackEnabled && (
        <Link className="floating-feedback-link" href="/avaliacao" aria-label="Avaliar o site">
          <span>★</span>
          <strong>Avalie o site</strong>
        </Link>
      )}

      {settings.forgeConnectEnabled && <ForgeConnectWidget />}
      <Footer />
    </>
  );
}
