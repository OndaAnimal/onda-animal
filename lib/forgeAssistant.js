function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function template(value, settings = {}) {
  const replacements = {
    adoptionContactName: settings.adoptionContactName || "equipe de adoção",
    adoptionWhatsApp: settings.adoptionWhatsApp || "consulte a equipe pelo Forge Connect",
    gravataiWhatsApp: settings.gravataiWhatsApp || "consulte a equipe pelo Forge Connect",
    cachoeirinhaWhatsApp: settings.cachoeirinhaWhatsApp || "consulte a equipe pelo Forge Connect",
    gravataiAddress: settings.gravataiAddress || "endereço ainda não informado",
    cachoeirinhaAddress: settings.cachoeirinhaAddress || "endereço ainda não informado",
    phone1: settings.phone1 || "",
    phone2: settings.phone2 || "",
    siteName: settings.siteName || "Onda Animal",
    nfgOfficialUrl: settings.nfgOfficialUrl || "",
  };

  return String(value || "").replace(/\{\{(\w+)\}\}/g, (_, key) => replacements[key] ?? "");
}

function scoreEntry(text, entry) {
  const normalizedText = normalize(text);
  if (!normalizedText) return 0;

  const question = normalize(entry.question);
  const keywordPhrases = String(entry.keywords || "")
    .split(",")
    .map(normalize)
    .filter(Boolean);

  let score = 0;

  if (question && normalizedText.includes(question)) score += 8;

  keywordPhrases.forEach((phrase) => {
    if (!phrase) return;
    if (normalizedText === phrase) score += 7;
    else if (normalizedText.includes(phrase)) score += phrase.includes(" ") ? 5 : 3;
  });

  const queryTokens = new Set(normalizedText.split(" ").filter((token) => token.length >= 3));
  const knowledgeTokens = new Set(
    normalize(`${entry.question || ""} ${entry.keywords || ""}`)
      .split(" ")
      .filter((token) => token.length >= 3)
  );

  queryTokens.forEach((token) => {
    if (knowledgeTokens.has(token)) score += 1;
  });

  return score;
}


const BUILTIN_FORGE_MENU = [
  { id: "adotar", number: "1", label: "Quero adotar um animal", icon: "♡", keywords: "adotar, adoção, quero adotar, adocao", answer: "As adoções divulgadas pela Onda são exclusivamente dos animais que já fazem parte do nosso abrigo. Para adotar, abra a página Animais, escolha um perfil e envie o formulário de adoção. A equipe analisa as informações antes de aprovar a adoção.", handoff: false, active: true },
  { id: "entregar-animal", number: "2", label: "Quero doar/entregar um animal para a Onda", icon: "!", keywords: "doar animal, entregar animal, deixar animal, vocês pegam animal, receber animal, abrigo aceita animal", answer: "IMPORTANTE: A ONDA ANIMAL NÃO RECEBE ANIMAIS DE TUTORES OU TERCEIROS PARA FICAR NO ABRIGO. O site divulga para adoção SOMENTE os animais que já estão sob responsabilidade do abrigo da Onda Animal.\n\nSe você precisa encontrar uma nova família para um animal, mantenha-o sob sua responsabilidade enquanto procura um adotante, faça boas fotos, informe idade/comportamento/saúde com transparência e divulgue em redes e grupos locais. Nunca abandone o animal na rua ou na porta da clínica/abrigo.", handoff: false, active: true },
  { id: "animal-encontrado", number: "3", label: "Encontrei um animal na rua", icon: "⌕", keywords: "achei cachorro, achei gato, encontrei animal, animal na rua, animal abandonado", answer: "Encontrar um animal na rua não significa que a Onda consiga recebê-lo no abrigo. Se for seguro, coloque-o temporariamente em local protegido, ofereça água, verifique identificação, tire fotos e divulgue em grupos de animais perdidos da região. Se estiver ferido ou em risco, procure atendimento veterinário ou o serviço público responsável pela proteção animal do município.", handoff: false, active: true },
  { id: "clinica", number: "4", label: "Clínica, consultas e serviços", icon: "+", keywords: "clínica, clinica, consulta, vacina, cirurgia, castração, exame, serviço", answer: "Para consultas, vacinas, exames, cirurgias e outros atendimentos, use a área Clínica do site. Cada serviço mostra as unidades disponíveis e o contato correto da unidade.", handoff: false, active: true },
  { id: "nfg", number: "5", label: "Nota Fiscal Gaúcha", icon: "NFG", keywords: "nota fiscal gaúcha, nota fiscal gaucha, nfg, cpf na nota", answer: "Você pode apoiar a ONDA pela Nota Fiscal Gaúcha. Abra a página ‘NF Gaúcha’ do site para ver o passo a passo e os dados da entidade. Entidade: ONDA • Gravataí • Defesa e Proteção dos Animais • Código SLD0187676.", handoff: false, active: true },
  { id: "equipe", number: "6", label: "Falar com a equipe", icon: "…", keywords: "falar com equipe, atendente, pessoa, humano, suporte", answer: "Certo. Vou abrir o atendimento humano para você.", handoff: true, active: true },
];

export function getForgeAssistantMenu(settings = {}) {
  const configured = Array.isArray(settings.forgeAssistantMenu) ? settings.forgeAssistantMenu : [];
  const items = configured.length ? configured : BUILTIN_FORGE_MENU;
  return items
    .filter((item) => item && item.active !== false && item.label)
    .map((item, index) => ({
      ...item,
      number: String(item.number || index + 1),
    }));
}

function menuReply(text, settings = {}) {
  if (settings.forgeAssistantMenuEnabled === false) return null;
  const normalized = normalize(text);
  if (!normalized) return null;

  const items = getForgeAssistantMenu(settings);
  const exactNumber = items.find((item) => normalized === normalize(item.number));
  if (exactNumber) {
    return {
      matched: true,
      answer: template(exactNumber.answer || "", settings),
      menuItemId: exactNumber.id,
      handoff: Boolean(exactNumber.handoff),
    };
  }

  const ranked = items
    .map((item) => ({
      item,
      score: scoreEntry(text, {
        question: item.label,
        keywords: `${item.number || ""},${item.keywords || ""}`,
      }),
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score >= 4) {
    return {
      matched: true,
      answer: template(ranked[0].item.answer || "", settings),
      menuItemId: ranked[0].item.id,
      handoff: Boolean(ranked[0].item.handoff),
    };
  }

  return null;
}

export function forgeAssistantReply(text, settings = {}) {
  if (settings.forgeAssistantEnabled === false) return null;

  const normalized = normalize(text);
  const assistantName = settings.forgeAssistantName || "Assistente Onda";

  const guided = menuReply(text, settings);
  if (guided) return guided;

  if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai|eai)\b/.test(normalized)) {
    return {
      matched: true,
      answer: `Olá! Eu sou o ${assistantName}. Posso ajudar com dúvidas sobre adoção, animais, unidades, serviços, veterinários e contatos da Onda Animal.`,
    };
  }

  if (/\b(obrigado|obrigada|valeu|agradeco|agradeço)\b/.test(normalized)) {
    return {
      matched: true,
      answer: "Por nada! Se precisar de mais alguma informação, é só me perguntar. 😊",
    };
  }

  const knowledge = Array.isArray(settings.forgeAssistantKnowledge)
    ? settings.forgeAssistantKnowledge.filter((item) => item && item.active !== false && item.answer)
    : [];

  const ranked = knowledge
    .map((entry) => ({ entry, score: scoreEntry(text, entry) }))
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score >= 3) {
    return {
      matched: true,
      answer: template(ranked[0].entry.answer, settings),
      entryId: ranked[0].entry.id,
    };
  }

  return {
    matched: false,
    answer: template(
      settings.forgeAssistantFallback
        || "Ainda não tenho uma resposta segura para essa dúvida. Sua mensagem ficou registrada e a equipe da Onda Animal pode continuar o atendimento por aqui.",
      settings
    ),
  };
}
