import "server-only";

const OPENAI_URL = "https://api.openai.com/v1/responses";

export function animalAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function modelName() {
  return process.env.OPENAI_MODEL || "gpt-5.6-luna";
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const pieces = [];
  for (const item of payload?.output || []) {
    if (item?.type !== "message") continue;
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        pieces.push(content.text);
      }
    }
  }
  return pieces.join("\n").trim();
}

async function requestStructured({ instructions, content, name, schema }) {
  if (!animalAiConfigured()) {
    throw new Error("OPENAI_API_KEY não configurada no Vercel.");
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelName(),
      instructions,
      input: [
        {
          role: "user",
          content,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name,
          strict: true,
          schema,
        },
      },
    }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message || `OpenAI respondeu HTTP ${response.status}.`;
    throw new Error(detail);
  }

  const raw = extractOutputText(payload);
  if (!raw) throw new Error("A IA não retornou conteúdo.");

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("A IA retornou uma resposta que não pôde ser interpretada.");
  }
}

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "nameSuggestion",
    "species",
    "sex",
    "age",
    "approximateBirth",
    "breed",
    "color",
    "size",
    "weight",
    "visualNotes",
    "confidenceSummary",
    "uncertainFields",
  ],
  properties: {
    nameSuggestion: { type: "string" },
    species: { type: "string", enum: ["Cão", "Gato"] },
    sex: { type: "string", enum: ["Macho", "Fêmea", "Não identificado"] },
    age: { type: "string" },
    approximateBirth: { type: "string" },
    breed: { type: "string" },
    color: { type: "string" },
    size: { type: "string", enum: ["Pequeno", "Médio", "Grande", "Não identificado"] },
    weight: { type: "string" },
    visualNotes: { type: "string" },
    confidenceSummary: { type: "string" },
    uncertainFields: {
      type: "array",
      items: { type: "string" },
    },
  },
};

const COPY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "story", "idealHome"],
  properties: {
    summary: { type: "string" },
    story: { type: "string" },
    idealHome: { type: "string" },
  },
};

const TEXT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["text"],
  properties: { text: { type: "string" } },
};

export async function analyzeAnimalPhotos(photos) {
  const cleanPhotos = (Array.isArray(photos) ? photos : [])
    .filter((url) => typeof url === "string" && /^https?:\/\//.test(url))
    .slice(0, 4);

  if (!cleanPhotos.length) throw new Error("Envie pelo menos uma foto antes de usar a IA.");

  const currentYear = new Date().getFullYear();
  const content = [
    {
      type: "input_text",
      text: [
        "Analise as fotos deste animal que está sendo cadastrado para adoção na Onda Animal.",
        `O ano atual é ${currentYear}.`,
        "Sugira um nome curto e simpático em português.",
        "Identifique espécie e características visuais apenas quando houver base na imagem.",
        "Sexo: se a anatomia não estiver claramente visível, retorne 'Não identificado'. Não adivinhe pelo rosto, cor ou porte.",
        "Idade e nascimento são apenas estimativas visuais; use linguagem aproximada.",
        "Raça: se não houver evidência clara, use 'Sem raça definida'.",
        "Peso: só estime se houver referência visual razoável; caso contrário use 'Não estimado'.",
        "Não invente vacinação, castração, vermifugação, doenças, comportamento, energia ou compatibilidade com pessoas/animais.",
        "Em uncertainFields liste tudo que precisa de confirmação humana.",
        "Responda em português do Brasil.",
      ].join("\n"),
    },
    ...cleanPhotos.map((url) => ({ type: "input_image", image_url: url })),
  ];

  return requestStructured({
    instructions:
      "Você é um assistente de cadastro responsável para adoção animal. Diferencie observação visual de fatos que exigem confirmação humana. Nunca trate inferências incertas como fatos.",
    content,
    name: "onda_animal_visual_profile",
    schema: ANALYSIS_SCHEMA,
  });
}

function animalFactsText(animal = {}) {
  const temperament = Array.isArray(animal.temperament)
    ? animal.temperament.join(", ")
    : animal.temperament || "Não avaliado";
  const compatibility = animal.compatibility || {};

  return [
    `Nome: ${animal.name || "Não informado"}`,
    `Espécie: ${animal.species || "Não informada"}`,
    `Sexo: ${animal.sex || "Não informado"}`,
    `Idade: ${animal.age || "Não informada"}`,
    `Nascimento aproximado: ${animal.approximateBirth || "Não informado"}`,
    `Raça: ${animal.breed || "Não informada"}`,
    `Cor: ${animal.color || "Não informada"}`,
    `Porte: ${animal.size || "Não informado"}`,
    `Peso: ${animal.weight || "Não informado"}`,
    `Energia: ${animal.energy || "Não avaliada"}`,
    `Temperamento confirmado: ${temperament || "Não avaliado"}`,
    `Vacinado: ${animal.vaccinated ? "Sim" : "Não/Não informado"}`,
    `Castrado: ${animal.neutered ? "Sim" : "Não/Não informado"}`,
    `Vermifugado: ${animal.dewormed ? "Sim" : "Não/Não informado"}`,
    `Necessidades especiais: ${animal.specialNeeds ? "Sim" : "Não/Não informado"}`,
    `Convive com cães: ${compatibility.dogs || "Não avaliado"}`,
    `Convive com gatos: ${compatibility.cats || "Não avaliado"}`,
    `Convive com crianças: ${compatibility.children || "Não avaliado"}`,
    `Observações internas: ${animal.observations || "Nenhuma"}`,
  ].join("\n");
}

export async function composeAnimalTexts(animal) {
  const facts = animalFactsText(animal);
  const content = [
    {
      type: "input_text",
      text: [
        "Crie os textos públicos do perfil de adoção da Onda Animal usando SOMENTE os fatos confirmados abaixo.",
        "Não transforme 'não informado' ou 'não avaliado' em afirmações positivas ou negativas.",
        "Não invente passado, resgate, abandono, traumas, saúde, personalidade ou convivência.",
        "Resumo do card: atraente, natural e curto, idealmente até 280 caracteres.",
        "História completa: 2 ou 3 parágrafos acolhedores. Se não houver história factual, apresente o animal sem inventar acontecimentos.",
        "Lar ideal: 1 parágrafo objetivo, baseado apenas em porte, energia, temperamento e compatibilidades confirmadas.",
        "Tom: humano, responsável, sem exageros e sem prometer comportamento futuro.",
        "Português do Brasil.",
        "\nDADOS CONFIRMADOS:\n" + facts,
      ].join("\n"),
    },
  ];

  return requestStructured({
    instructions: "Você redige perfis responsáveis de adoção para uma clínica veterinária.",
    content,
    name: "onda_animal_adoption_copy",
    schema: COPY_SCHEMA,
  });
}

export async function rewriteAnimalText(field, animal, currentText = "") {
  const allowed = {
    summary: "Resumo do card",
    story: "História completa",
    idealHome: "Lar ideal",
  };
  if (!allowed[field]) throw new Error("Campo de texto inválido para a IA.");

  const facts = animalFactsText(animal);
  const limits = {
    summary: "Seja curto e atraente, idealmente até 280 caracteres.",
    story: "Use 2 ou 3 parágrafos. Não invente acontecimentos da vida do animal.",
    idealHome: "Use 1 parágrafo objetivo e responsável.",
  };

  const content = [
    {
      type: "input_text",
      text: [
        `Reescreva ou gere o campo '${allowed[field]}' para o perfil de adoção.`,
        limits[field],
        "Use somente fatos confirmados. Não invente saúde, história, comportamento ou compatibilidades.",
        `Texto atual: ${currentText || "(vazio)"}`,
        "\nDADOS CONFIRMADOS:\n" + facts,
      ].join("\n"),
    },
  ];

  return requestStructured({
    instructions: "Escreva em português do Brasil com tom acolhedor e responsável.",
    content,
    name: "onda_animal_rewrite",
    schema: TEXT_SCHEMA,
  });
}
