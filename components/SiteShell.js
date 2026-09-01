import SiteSettingsProvider from "./SiteSettingsProvider";
import SiteShellClient from "./SiteShellClient";
import { DEFAULT_SITE_SETTINGS } from "../lib/localData";
import { getSiteData } from "../lib/serverStore";

export default async function SiteShell({ children }) {
  let initialSettings = DEFAULT_SITE_SETTINGS;

  try {
    const stored = await getSiteData("settings", DEFAULT_SITE_SETTINGS);
    initialSettings = { ...DEFAULT_SITE_SETTINGS, ...(stored || {}) };
  } catch {
    // Mantém o site utilizável mesmo durante um build local sem DATABASE_URL.
  }

  return (
    <SiteSettingsProvider initialSettings={initialSettings}>
      <SiteShellClient>{children}</SiteShellClient>
    </SiteSettingsProvider>
  );
}
