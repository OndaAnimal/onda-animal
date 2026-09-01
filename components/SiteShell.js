"use client";

import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import ForgeConnectWidget from "./ForgeConnectWidget";
import SiteSettingsProvider, { useSiteSettings } from "./SiteSettingsProvider";

function SiteShellContent({ children }) {
  const { settings } = useSiteSettings();

  if (settings.maintenanceEnabled) {
    return (
      <main className="maintenance-page">
        <div className="maintenance-card">
          <img src={settings.logo || "/logo.png"} alt={settings.siteName} />
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

export default function SiteShell({ children }) {
  return (
    <SiteSettingsProvider>
      <SiteShellContent>{children}</SiteShellContent>
    </SiteSettingsProvider>
  );
}
