"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SITE_SETTINGS } from "../lib/localData";
import { fetchPublicResource } from "../lib/apiClient";

const SiteSettingsContext = createContext({
  settings: DEFAULT_SITE_SETTINGS,
});

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

export default function SiteSettingsProvider({ children, initialSettings = DEFAULT_SITE_SETTINGS }) {
  const [settings, setSettings] = useState({ ...DEFAULT_SITE_SETTINGS, ...(initialSettings || {}) });

  useEffect(() => {
    let active = true;

    const sync = async () => {
      const remote = await fetchPublicResource("settings", initialSettings);
      if (active) setSettings({ ...DEFAULT_SITE_SETTINGS, ...(remote || {}) });
    };

    sync();
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [initialSettings]);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--teal", settings.primaryColor);
    root.style.setProperty("--teal-dark", settings.primaryDark);
    root.style.setProperty("--teal-deep", settings.primaryDeep);
    root.style.setProperty("--navy", settings.navyColor);
    root.style.setProperty("--accent", settings.accentColor);
    root.style.setProperty("--bg", settings.backgroundColor);
    root.style.setProperty("--ink", settings.textColor);
    root.style.setProperty("--cms-radius", `${Number(settings.borderRadius || 20)}px`);
    root.style.setProperty("--cms-font-scale", String(settings.fontScale || 1));
    root.style.setProperty("--cms-header-bg", settings.headerBackground);
    root.style.setProperty("--cms-footer-bg", settings.footerBackground);

    document.body.style.fontSize = `${Number(settings.fontScale || 1) * 100}%`;
    document.title = settings.seoTitle || DEFAULT_SITE_SETTINGS.seoTitle;

    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement("meta");
      description.setAttribute("name", "description");
      document.head.appendChild(description);
    }
    description.setAttribute("content", settings.seoDescription || "");

    let icon = document.querySelector('link[data-onda-dynamic-favicon="1"]');
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      icon.dataset.ondaDynamicFavicon = "1";
      document.head.appendChild(icon);
    }
    icon.href = settings.favicon || settings.logo || "/logo.png";

    let customStyle = document.getElementById("onda-custom-css");
    if (!customStyle) {
      customStyle = document.createElement("style");
      customStyle.id = "onda-custom-css";
      document.head.appendChild(customStyle);
    }
    customStyle.textContent = settings.customCss || "";
  }, [settings]);

  return (
    <SiteSettingsContext.Provider value={{ settings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}
