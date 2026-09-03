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

export function forgeAssistantReply(text, settings = {}) {
  if (settings.forgeAssistantEnabled === false) return null;

  const normalized = normalize(text);
  const assistantName = settings.forgeAssistantName || "Assistente Onda";

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
