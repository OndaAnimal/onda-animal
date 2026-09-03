export const ANIMALS_KEY = "ondaAnimals";
export const APPLICATIONS_KEY = "onda_adoption_applications";
export const FEEDBACK_KEY = "ondaSiteFeedback";
export const SETTINGS_KEY = "ondaAdminSettings";
export const CONNECT_KEY = "forgepets_connect_v1";
export const CONNECT_VISITOR_KEY = "forge_connect_onda_visitor_v1";
export const STORIES_KEY = "ondaAdoptionStories";

export function safeParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function syncAdmin(action, payload = {}) {
  if (typeof window === "undefined") return;
  fetch("/api/admin/state", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  }).catch((error) => console.error("Falha ao sincronizar com Neon", error));
}

export function loadAnimals(seed = []) {
  if (typeof window === "undefined") return seed;
  const stored = safeParse(localStorage.getItem(ANIMALS_KEY), null);
  if (Array.isArray(stored)) return stored;
  localStorage.setItem(ANIMALS_KEY, JSON.stringify(seed));
  return seed;
}

export function saveAnimals(animals) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ANIMALS_KEY, JSON.stringify(animals));
    window.dispatchEvent(new Event("onda-animals-updated"));
    syncAdmin("saveResource", { resource: "animals", value: animals });
  }
}

export function loadApplications() {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(APPLICATIONS_KEY), []);
}

export function saveApplications(items) {
  if (typeof window !== "undefined") {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(items));
    syncAdmin("bulkApplications", { items });
  }
}

export function loadFeedback() {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(FEEDBACK_KEY), []);
}

export const DEFAULT_SITE_SETTINGS = {
  // Marca
  siteName: "ONDA ANIMAL",
  siteSubtitle: "ADOÇÃO & CLÍNICA VETERINÁRIA",
  logo: "/logo.png",
  favicon: "/logo.png",

  // Identidade visual
  primaryColor: "#37b8b8",
  primaryDark: "#158d92",
  primaryDeep: "#0b6f78",
  navyColor: "#173f4b",
  accentColor: "#b63a5e",
  backgroundColor: "#f8fbfc",
  textColor: "#15313a",
  headerBackground: "#f8fbfc",
  footerBackground: "#0e353e",
  borderRadius: "20",
  fontScale: "1",

  // Aviso superior
  announcementEnabled: false,
  announcementText: "Adoção responsável: conheça nossos animais disponíveis.",
  announcementButtonText: "Ver animais",
  announcementButtonLink: "/adocao",
  announcementBackground: "#173f4b",
  announcementTextColor: "#ffffff",

  // Cabeçalho / menu
  showMenuHome: true,
  showMenuAnimals: true,
  showMenuHowAdopt: true,
  showMenuStories: true,
  showMenuClinic: true,
  showMenuVeterinarians: true,
  showMenuContact: true,
  showMenuFeedback: true,
  showAdoptButton: true,
  adoptButtonText: "Quero adotar",
  showAdminButton: true,
  adminButtonText: "Painel",

  // Home / Banner principal
  heroEnabled: true,
  heroBannerImage: "",
  heroOverlay: "0.16",
  heroEyebrow: "Adoção responsável Onda Animal",
  heroTitle: "Talvez o seu novo melhor amigo esteja esperando por você.",
  heroText: "Conheça cães e gatos que procuram uma família. Veja fotos, história, comportamento, cuidados de saúde e encontre um companheiro para a vida.",
  heroPrimaryText: "Ver animais para adoção",
  heroPrimaryLink: "/adocao",
  heroSecondaryText: "Como funciona a adoção",
  heroSecondaryLink: "/como-adotar",
  heroBadge1: "♡ Adoção responsável",
  heroBadge2: "✓ Avaliação veterinária",
  heroBadge3: "⌂ Família definitiva",

  // Faixa de etapas
  stepsStripEnabled: true,
  stripStep1: "Conheça os animais",
  stripStep2: "Escolha com responsabilidade",
  stripStep3: "Converse com a equipe",
  stripStep4: "Leve amor para casa",

  // Seção animais da home
  homeAnimalsEnabled: true,
  homeAnimalsEyebrow: "Esperando por uma família",
  homeAnimalsTitle: "Conheça alguns dos nossos animais.",
  homeAnimalsText: "Cada perfil mostra idade, porte, comportamento, saúde e outras informações importantes.",
  homeAnimalsButtonText: "Ver todos os animais",

  // Processo de adoção
  processEnabled: true,
  processEyebrow: "Adoção consciente",
  processTitle: "Não é só escolher pela foto.",
  processText: "Queremos encontrar famílias que combinem com o perfil de cada animal. Por isso o site mostra porte, idade, comportamento, saúde e outras informações antes do primeiro contato.",
  processButtonText: "Entender o processo de adoção →",
  processStep1Title: "Escolha",
  processStep1Text: "Veja os perfis disponíveis.",
  processStep2Title: "Converse",
  processStep2Text: "Conte um pouco sobre sua casa.",
  processStep3Title: "Compatibilidade",
  processStep3Text: "A equipe avalia o melhor encaixe.",
  processStep4Title: "Adoção",
  processStep4Text: "Uma nova história começa.",

  // CTA clínica da home
  clinicCtaEnabled: true,
  clinicCtaEyebrow: "Onda Animal",
  clinicCtaTitle: "O cuidado veterinário continua por trás de cada história.",
  clinicCtaText: "A clínica segue com sua estrutura e serviços, agora com a adoção ganhando destaque no site.",
  clinicCtaButtonText: "Conhecer a clínica",
  clinicCtaButtonLink: "/servicos",

  // Contatos
  adoptionContactName: "Luise",
  adoptionWhatsApp: "",
  adoptionEmail: "",
  phone1: "(51) 3112-5091",
  phone1Raw: "+555131125091",
  phone2: "(51) 3041-5081",
  phone2Raw: "+555130415081",
  gravataiWhatsApp: "",
  cachoeirinhaWhatsApp: "",
  generalEmail: "",
  instagram: "",
  facebook: "",
  gravataiAddress: "Rua Francisco Tafas, 67 — Salgado Filho, Gravataí/RS",
  cachoeirinhaAddress: "",

  // Página de contato
  contactEyebrow: "Fale com a Onda Animal",
  contactTitle: "Quer adotar ou precisa falar com a clínica?",
  contactText: "Escolha o assunto e entre em contato com a equipe.",
  contactAdoptionTitle: "Tenho interesse em adotar",
  contactAdoptionText: "Escolha o animal e depois fale com a equipe contando um pouco sobre sua casa e rotina.",
  contactClinicTitle: "Atendimento veterinário",
  contactClinicText: "Para consultas, exames, procedimentos ou informações sobre as unidades.",

  // Rodapé
  footerText: "© 2026 Onda Animal. Todos os direitos reservados.",
  footerShowAnimals: true,
  footerShowHowAdopt: true,
  footerShowVeterinarians: true,
  footerShowFeedback: true,
  footerShowContact: true,

  // Módulos
  feedbackEnabled: true,
  floatingFeedbackEnabled: true,
  forgeConnectEnabled: true,
  storiesEnabled: true,
  maintenanceEnabled: false,
  maintenanceTitle: "Estamos preparando novidades.",
  maintenanceText: "O site está temporariamente em manutenção. Em breve estaremos de volta.",

  // SEO / navegador (modo local)
  seoTitle: "Onda Animal | Adoção & Clínica Veterinária",
  seoDescription: "Portal de adoção responsável e serviços veterinários da Onda Animal.",
  socialImage: "",

  // Avançado
  customCss: "",
};

export function loadSettings() {
  if (typeof window === "undefined") return DEFAULT_SITE_SETTINGS;
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...safeParse(localStorage.getItem(SETTINGS_KEY), {}),
  };
}

export function saveSettings(settings) {
  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("onda-settings-updated"));
    syncAdmin("saveResource", { resource: "settings", value: settings });
  }
}


export function loadConnect() {
  const fallback = { conversations: [], tickets: [], news: [], help: [] };
  if (typeof window === "undefined") return fallback;

  const stored = safeParse(localStorage.getItem(CONNECT_KEY), fallback);

  if (!Array.isArray(stored.conversations) && Array.isArray(stored.messages)) {
    return {
      ...fallback,
      ...stored,
      conversations: stored.messages.length
        ? [{
            id: "legacy",
            site: "Onda Animal",
            status: "ABERTA",
            topic: "Conversa anterior",
            visitor: { name: "Visitante", whatsapp: "" },
            createdAt: new Date().toISOString(),
            messages: stored.messages,
          }]
        : [],
    };
  }

  return {
    ...fallback,
    ...stored,
    conversations: Array.isArray(stored.conversations) ? stored.conversations : [],
  };
}

export function saveConnect(data) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONNECT_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("forge-connect-updated"));
  }
}

export function loadConnectVisitor() {
  if (typeof window === "undefined") return null;
  return safeParse(localStorage.getItem(CONNECT_VISITOR_KEY), null);
}

export function saveConnectVisitor(visitor) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONNECT_VISITOR_KEY, JSON.stringify(visitor));
  }
}


export function loadStories() {
  if (typeof window === "undefined") return [];
  return safeParse(localStorage.getItem(STORIES_KEY), []);
}

export function saveStories(items) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORIES_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("onda-stories-updated"));
    syncAdmin("saveResource", { resource: "stories", value: items });
  }
}
