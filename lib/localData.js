import { DEFAULT_ANIMAL_PROFILE_OPTIONS } from "../data/animalProfileOptions";

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

  // Cadastro dos animais / opções dos modais
  showPublicAnimalViews: true,
  animalProfileOptions: {
    temperament: [...DEFAULT_ANIMAL_PROFILE_OPTIONS.temperament],
    compatibilityDogs: [...DEFAULT_ANIMAL_PROFILE_OPTIONS.compatibilityDogs],
    compatibilityCats: [...DEFAULT_ANIMAL_PROFILE_OPTIONS.compatibilityCats],
    compatibilityChildren: [...DEFAULT_ANIMAL_PROFILE_OPTIONS.compatibilityChildren],
    summary: [...DEFAULT_ANIMAL_PROFILE_OPTIONS.summary],
    story: [...DEFAULT_ANIMAL_PROFILE_OPTIONS.story],
    idealHome: [...DEFAULT_ANIMAL_PROFILE_OPTIONS.idealHome],
  },

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

  // Página da equipe veterinária
  vetsPageEyebrow: "Nossa equipe",
  vetsPageTitle: "Conheça quem cuida de cada história.",
  vetsPageText: "Profissionais que unem conhecimento, experiência e carinho para cuidar do seu pet.",
  vetsIntroEyebrow: "Equipe Onda Animal",
  vetsIntroTitle: "Veterinários que fazem parte da nossa rotina.",
  vetsIntroText: "Conheça um pouco mais sobre nossos profissionais, suas áreas de atuação e escolha com quem deseja falar para agendar o atendimento.",

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
  footerShowDeveloperCredit: true,
  footerDeveloperPrefix: "Desenvolvido por",
  footerDeveloperName: "Forge Labs",
  footerDeveloperUrl: "",
  footerShowAnimals: true,
  footerShowHowAdopt: true,
  footerShowVeterinarians: true,
  footerShowFeedback: true,
  footerShowContact: true,

  // Módulos
  feedbackEnabled: true,
  floatingFeedbackEnabled: true,
  forgeConnectEnabled: true,

  // Assistente virtual gratuito do Forge Connect
  forgeAssistantEnabled: true,
  forgeAssistantName: "Assistente Onda",
  forgeAssistantWelcome: "Olá! Sou o Assistente Onda. Posso responder dúvidas rápidas sobre adoção, clínica, unidades, serviços e equipe. Se eu não souber, sua mensagem fica para a equipe continuar o atendimento.",
  forgeAssistantFallback: "Ainda não tenho uma resposta segura para essa dúvida. Sua mensagem ficou registrada e a equipe da Onda Animal pode continuar o atendimento por aqui.",
  forgeAssistantKnowledge: [
  {
    "id": "adocao-como-funciona",
    "question": "Como funciona a adoção?",
    "keywords": "adoção, adotar, quero adotar, como adoto, processo de adoção, formulário adoção",
    "answer": "Para adotar, escolha um animal na página de adoção, leia o perfil completo e envie o formulário de interesse. A equipe analisa as informações e entra em contato depois da avaliação.",
    "active": true
  },
  {
    "id": "fotos-moradia",
    "question": "Quais fotos da casa preciso enviar?",
    "keywords": "fotos da casa, foto moradia, janela, janelas, tela, telas, pátio, patio, apartamento, casa adoção",
    "answer": "Para felinos, o formulário solicita fotos das janelas/telas para verificar a segurança da moradia. Para cães, é solicitada foto do pátio ou área externa. Essas fotos ajudam a equipe na avaliação responsável da adoção.",
    "active": true
  },
  {
    "id": "unidades-enderecos",
    "question": "Onde ficam as unidades?",
    "keywords": "endereço, endereco, localização, localizacao, onde fica, unidade, gravataí, gravatai, cachoeirinha",
    "answer": "Gravataí: {{gravataiAddress}}. Cachoeirinha: {{cachoeirinhaAddress}}.",
    "active": true
  },
  {
    "id": "contato-adocao",
    "question": "Qual o contato para adoção?",
    "keywords": "luise, contato adoção, contato adocao, whatsapp adoção, whatsapp adocao, responsável adoção",
    "answer": "{{adoptionContactName}} é responsável pelas adoções. WhatsApp: {{adoptionWhatsApp}}.",
    "active": true
  },
  {
    "id": "contato-unidades",
    "question": "Qual o WhatsApp das unidades?",
    "keywords": "whatsapp gravataí, whatsapp gravatai, whatsapp cachoeirinha, contato clínica, contato clinica, telefone unidade",
    "answer": "WhatsApp Gravataí: {{gravataiWhatsApp}}. WhatsApp Cachoeirinha: {{cachoeirinhaWhatsApp}}.",
    "active": true
  },
  {
    "id": "veterinarios",
    "question": "Quais veterinários atendem?",
    "keywords": "veterinário, veterinario, veterinária, veterinaria, doutor, doutora, dr, dra, profissional, equipe veterinária",
    "answer": "Na página “Veterinários” você encontra a equipe, áreas de atuação e as unidades em que cada profissional atende. Ao escolher um profissional, o agendamento mostra somente as unidades habilitadas para ele.",
    "active": true
  },
  {
    "id": "servicos",
    "question": "Quais serviços a clínica oferece?",
    "keywords": "serviço, servicos, serviços, consulta, vacina, cirurgia, castração, castracao, exame, clínica, clinica",
    "answer": "Na área “Clínica” do site você encontra os serviços disponíveis. Ao abrir um serviço, pode escolher a unidade e seguir direto para o WhatsApp configurado daquela unidade.",
    "active": true
  },
  {
    "id": "horarios",
    "question": "Qual o horário de atendimento?",
    "keywords": "horário, horario, abre, fecha, funcionamento, que horas, atendimento hoje",
    "answer": "Os horários podem variar conforme a unidade, o serviço e o profissional. Para confirmar o horário do atendimento desejado, fale com a unidade: Gravataí {{gravataiWhatsApp}} • Cachoeirinha {{cachoeirinhaWhatsApp}}.",
    "active": true
  },
  {
    "id": "status-adocao",
    "question": "Como sei se fui aprovado para adoção?",
    "keywords": "aprovado, aprovação, aprovacao, resultado adoção, status adoção, formulário enviado, formulario enviado, análise, analise",
    "answer": "Depois do envio, a solicitação passa por análise da equipe. O contato é feito após a avaliação para informar os próximos passos. O envio do formulário não garante aprovação automática.",
    "active": true
  }
],
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
