"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { submitAdoptionApplication, uploadAdoptionImage } from "../lib/apiClient";

const initialForm = {
  fullName: "",
  age: "",
  whatsapp: "",
  email: "",
  city: "",
  neighborhood: "",
  housingType: "",
  housingOwnership: "",
  petsAllowed: "",
  protectedHome: "",
  adults: "",
  children: "",
  childrenAges: "",
  otherPets: "",
  otherPetsDetails: "",
  hoursAlone: "",
  petStay: "",
  exerciseRoutine: "",
  travelPlan: "",
  previousExperience: "",
  previousPetDetails: "",
  adoptionReason: "",
  householdAgreement: "",
  financialCommitment: "",
  adaptationCommitment: "",
  observations: "",
  contactConsent: false,
  housingPhotoConsent: false,
  responsibleAdult: false,
};

function Choice({ name, value, current, onChange, children }) {
  return (
    <label className={current === value ? "adoption-choice selected" : "adoption-choice"}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={(event) => onChange(name, event.target.value)}
      />
      <span>{children}</span>
    </label>
  );
}

function HousingPhotoField({ title, text, requiredText, items, onAdd, onRemove }) {
  return (
    <div className="housing-photo-field">
      <div className="housing-photo-field-head">
        <div>
          <strong>{title}</strong>
          <p>{text}</p>
        </div>
        <span>{requiredText}</span>
      </div>

      <div className="housing-photo-previews">
        {items.map((item, index) => (
          <div className="housing-photo-preview" key={item.id}>
            <img src={item.preview} alt={`${title} ${index + 1}`} />
            <button type="button" onClick={() => onRemove(item.id)} aria-label="Remover foto">×</button>
            <small>Foto {index + 1}</small>
          </div>
        ))}

        {items.length < 6 && (
          <label className="housing-photo-add">
            <span>＋</span>
            <strong>Adicionar fotos</strong>
            <small>JPG, PNG ou WEBP</small>
            <input type="file" accept="image/*" multiple onChange={(e) => { onAdd(e.target.files); e.target.value = ""; }} />
          </label>
        )}
      </div>
    </div>
  );
}

export default function AdoptionForm({ animal }) {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendingStage, setSendingStage] = useState("");
  const [applicationId] = useState(() =>
    `OA-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 12).toUpperCase()}`
  );
  const [housingFiles, setHousingFiles] = useState({ windows: [], patio: [] });

  const compatibilitySummary = useMemo(() => ([
    ["Energia", animal.energy],
    ["Com cães", animal.compatibility?.dogs || "Não informado"],
    ["Com gatos", animal.compatibility?.cats || "Não informado"],
    ["Com crianças", animal.compatibility?.children || "Não informado"],
  ]), [animal]);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const addHousingFiles = (category, fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const invalid = files.find((file) =>
      (file.type && !file.type.startsWith("image/")) || file.size > 12 * 1024 * 1024
    );
    if (invalid) {
      setError("Envie apenas imagens de até 12 MB por arquivo.");
      return;
    }

    setHousingFiles((current) => {
      const available = Math.max(0, 6 - current[category].length);
      const nextItems = files.slice(0, available).map((file) => ({
        id: `${category}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      return { ...current, [category]: [...current[category], ...nextItems] };
    });
    setError("");
  };

  const removeHousingFile = (category, id) => {
    setHousingFiles((current) => {
      const item = current[category].find((entry) => entry.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return { ...current, [category]: current[category].filter((entry) => entry.id !== id) };
    });
  };

  const isFeline = ["gato", "felino"].includes(String(animal.species || "").toLowerCase());

  const validateHousingPhotos = () => {
    if (isFeline && housingFiles.windows.length < 2) {
      return "Para adoção de felinos, envie pelo menos 2 fotos das janelas/telas da moradia.";
    }
    if (!isFeline && housingFiles.patio.length < 1) {
      return "Para adoção de caninos, envie pelo menos 1 foto do pátio ou área externa disponível.";
    }
    return "";
  };

  const uploadHousingGroup = async (category) => {
    const items = housingFiles[category] || [];
    const uploaded = [];
    for (let index = 0; index < items.length; index += 1) {
      const result = await uploadAdoptionImage(items[index].file, {
        applicationId,
        animalSlug: animal.slug,
        category,
        index,
      });
      uploaded.push(result.url);
    }
    return uploaded;
  };

  const requiredFields = [
    "fullName", "age", "whatsapp", "city",
    "housingType", "housingOwnership", "petsAllowed",
    "protectedHome", "adults", "children", "otherPets",
    "hoursAlone", "petStay", "previousExperience",
    "adoptionReason", "householdAgreement",
    "financialCommitment", "adaptationCommitment"
  ];

  const submit = async (event) => {
    event.preventDefault();

    const missing = requiredFields.some((field) => !String(form[field] || "").trim());
    if (missing || !form.contactConsent || !form.housingPhotoConsent || !form.responsibleAdult) {
      setError("Preencha os campos obrigatórios e confirme as declarações no final do formulário.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const numericAge = Number(form.age);
    if (!Number.isFinite(numericAge) || numericAge < 18) {
      setError("O responsável pelo pedido de adoção deve ter 18 anos ou mais.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const photoError = validateHousingPhotos();
    if (photoError) {
      setError(photoError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const code = applicationId;

    setSending(true);
    setSendingStage("Enviando fotos da moradia...");
    try {
      const housingPhotos = {
        windows: isFeline ? await uploadHousingGroup("windows") : [],
        patio: !isFeline ? await uploadHousingGroup("patio") : [],
      };

      setSendingStage("Enviando formulário para análise...");

      const application = {
      id: code,
      animalSlug: animal.slug,
      animalName: animal.name,
      status: "EM_ANALISE",
      createdAt: new Date().toISOString(),
      applicant: { ...form, housingPhotos },
    };

      await submitAdoptionApplication(application);
      setProtocol(code);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (sendError) {
      console.error(sendError);
      setError(sendError.message || "Não foi possível enviar sua solicitação. Tente novamente.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSending(false);
      setSendingStage("");
    }
  };

  if (submitted) {
    return (
      <div className="adoption-success">
        <div className="adoption-success-icon">✓</div>
        <span className="eyebrow">Solicitação enviada</span>
        <h1>Seu interesse em {animal.name} está em análise.</h1>
        <p className="adoption-success-lead">
          A equipe da Onda Animal vai avaliar as informações considerando o perfil,
          a rotina e as necessidades de {animal.name}. Depois, entrará em contato
          pelo telefone informado.
        </p>

        <div className="adoption-status-card">
          <div>
            <small>Status</small>
            <strong>Em análise</strong>
          </div>
          <div>
            <small>Protocolo</small>
            <strong>{protocol}</strong>
          </div>
          <div>
            <small>Animal</small>
            <strong>{animal.name}</strong>
          </div>
        </div>

        <div className="adoption-warning-box">
          <strong>Importante</strong>
          <p>
            O envio do formulário não garante a adoção. A aprovação depende da
            compatibilidade entre a família interessada e as características do animal.
          </p>
        </div>

        <div className="hero-actions adoption-success-actions">
          <Link className="button primary" href="/adocao">Ver outros animais</Link>
          <Link className="button secondary" href="/">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <form className="adoption-form" onSubmit={submit}>
      {error && (
        <div className="adoption-form-error" role="alert">
          <strong>Falta só um pouco.</strong>
          <span>{error}</span>
        </div>
      )}

      <section className="adoption-form-section intro-section">
        <div>
          <span className="eyebrow">Interesse em adoção</span>
          <h1>Conte um pouco sobre você.</h1>
          <p>
            As respostas ajudam a equipe a entender se sua rotina combina com as
            necessidades de {animal.name}. Não existe aprovação automática.
          </p>
        </div>

        <aside className="selected-animal-mini">
          <img src={animal.photos?.[0]} alt={animal.name} />
          <div>
            <small>VOCÊ ESCOLHEU</small>
            <strong>{animal.name}</strong>
            <span>{animal.age} • {animal.size} • {animal.city}</span>
          </div>
        </aside>
      </section>

      <section className="adoption-match-summary">
        <div className="adoption-match-heading">
          <span>Perfil de {animal.name}</span>
          <p>Use estas informações para responder com sinceridade.</p>
        </div>
        <div className="adoption-match-grid">
          {compatibilitySummary.map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="adoption-form-section">
        <div className="form-section-heading">
          <span>01</span>
          <div>
            <h2>Seus dados</h2>
            <p>Informações para a equipe entrar em contato.</p>
          </div>
        </div>

        <div className="adoption-fields-grid">
          <label className="field span-2">
            <span>Nome completo *</span>
            <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="Seu nome completo" />
          </label>

          <label className="field">
            <span>Idade *</span>
            <input type="number" min="18" value={form.age} onChange={(e) => update("age", e.target.value)} placeholder="Ex.: 31" />
          </label>

          <label className="field">
            <span>WhatsApp *</span>
            <input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="(51) 99999-9999" />
          </label>

          <label className="field span-2">
            <span>E-mail</span>
            <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="seuemail@exemplo.com" />
          </label>

          <label className="field">
            <span>Cidade *</span>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Sua cidade" />
          </label>

          <label className="field">
            <span>Bairro</span>
            <input value={form.neighborhood} onChange={(e) => update("neighborhood", e.target.value)} placeholder="Seu bairro" />
          </label>
        </div>
      </section>

      <section className="adoption-form-section">
        <div className="form-section-heading">
          <span>02</span>
          <div>
            <h2>Sua casa</h2>
            <p>Queremos entender onde o animal vai viver.</p>
          </div>
        </div>

        <div className="form-question">
          <strong>Você mora em: *</strong>
          <div className="choice-grid">
            <Choice name="housingType" value="Casa" current={form.housingType} onChange={update}>Casa</Choice>
            <Choice name="housingType" value="Apartamento" current={form.housingType} onChange={update}>Apartamento</Choice>
            <Choice name="housingType" value="Outro" current={form.housingType} onChange={update}>Outro</Choice>
          </div>
        </div>

        <div className="form-question">
          <strong>O imóvel é: *</strong>
          <div className="choice-grid">
            <Choice name="housingOwnership" value="Próprio" current={form.housingOwnership} onChange={update}>Próprio</Choice>
            <Choice name="housingOwnership" value="Alugado" current={form.housingOwnership} onChange={update}>Alugado</Choice>
            <Choice name="housingOwnership" value="Cedido" current={form.housingOwnership} onChange={update}>Cedido</Choice>
          </div>
        </div>

        <div className="form-question">
          <strong>Animais são permitidos no local? *</strong>
          <div className="choice-grid">
            <Choice name="petsAllowed" value="Sim" current={form.petsAllowed} onChange={update}>Sim</Choice>
            <Choice name="petsAllowed" value="Não" current={form.petsAllowed} onChange={update}>Não</Choice>
            <Choice name="petsAllowed" value="Não se aplica" current={form.petsAllowed} onChange={update}>Não se aplica</Choice>
          </div>
        </div>

        <div className="form-question">
          <strong>O ambiente é protegido e seguro para o animal? *</strong>
          <p className="question-help">Ex.: pátio fechado para cães ou janelas/telas adequadas para gatos.</p>
          <div className="choice-grid">
            <Choice name="protectedHome" value="Sim" current={form.protectedHome} onChange={update}>Sim</Choice>
            <Choice name="protectedHome" value="Parcialmente" current={form.protectedHome} onChange={update}>Parcialmente</Choice>
            <Choice name="protectedHome" value="Ainda não" current={form.protectedHome} onChange={update}>Ainda não</Choice>
          </div>
        </div>
      </section>

      <section className="adoption-form-section housing-photo-section">
        <div className="form-section-heading">
          <span>03</span>
          <div>
            <h2>Fotos da moradia</h2>
            <p>As imagens são obrigatórias e usadas apenas pela equipe na análise da adoção.</p>
          </div>
        </div>

        <div className="housing-photo-notice">
          <strong>Por que pedimos estas fotos?</strong>
          <p>Queremos confirmar que o ambiente é seguro e compatível com as necessidades de {animal.name}. As fotos ficam vinculadas somente à solicitação de adoção.</p>
        </div>

        {isFeline && (
          <HousingPhotoField
            title="Janelas e telas"
            text={form.housingType === "Apartamento"
              ? "Envie fotos das janelas do apartamento para verificarmos se estão devidamente teladas."
              : form.housingType === "Casa"
                ? "Envie fotos das janelas da casa para verificarmos se estão devidamente teladas e seguras para o felino."
                : "Envie fotos das principais janelas da moradia para verificarmos a segurança para o felino."}
            requiredText="OBRIGATÓRIO • MÍNIMO 2"
            items={housingFiles.windows}
            onAdd={(files) => addHousingFiles("windows", files)}
            onRemove={(id) => removeHousingFile("windows", id)}
          />
        )}

        {!isFeline && (
          <HousingPhotoField
            title="Pátio / área externa"
            text="Mostre o pátio, cercamento, portões ou a área externa disponível para o cão."
            requiredText="OBRIGATÓRIO • MÍNIMO 1"
            items={housingFiles.patio}
            onAdd={(files) => addHousingFiles("patio", files)}
            onRemove={(id) => removeHousingFile("patio", id)}
          />
        )}
      </section>

      <section className="adoption-form-section">
        <div className="form-section-heading">
          <span>04</span>
          <div>
            <h2>Quem mora com você?</h2>
            <p>A convivência da casa faz parte da análise.</p>
          </div>
        </div>

        <div className="adoption-fields-grid">
          <label className="field">
            <span>Quantos adultos moram na casa? *</span>
            <input type="number" min="1" value={form.adults} onChange={(e) => update("adults", e.target.value)} placeholder="Ex.: 2" />
          </label>

          <label className="field">
            <span>Há crianças? *</span>
            <select value={form.children} onChange={(e) => update("children", e.target.value)}>
              <option value="">Selecione</option>
              <option>Não</option>
              <option>Sim</option>
            </select>
          </label>

          {form.children === "Sim" && (
            <label className="field span-2">
              <span>Qual a idade das crianças?</span>
              <input value={form.childrenAges} onChange={(e) => update("childrenAges", e.target.value)} placeholder="Ex.: 6 e 10 anos" />
            </label>
          )}

          <label className="field">
            <span>Você já tem outros animais? *</span>
            <select value={form.otherPets} onChange={(e) => update("otherPets", e.target.value)}>
              <option value="">Selecione</option>
              <option>Não</option>
              <option>Sim</option>
            </select>
          </label>

          {form.otherPets === "Sim" && (
            <label className="field">
              <span>Quais animais?</span>
              <input value={form.otherPetsDetails} onChange={(e) => update("otherPetsDetails", e.target.value)} placeholder="Ex.: 1 cão macho castrado" />
            </label>
          )}
        </div>
      </section>

      <section className="adoption-form-section">
        <div className="form-section-heading">
          <span>05</span>
          <div>
            <h2>Rotina do futuro pet</h2>
            <p>Essas respostas ajudam a comparar sua rotina com o perfil do animal.</p>
          </div>
        </div>

        <div className="form-question">
          <strong>Quanto tempo, em média, o animal ficará sozinho por dia? *</strong>
          <div className="choice-grid four">
            <Choice name="hoursAlone" value="Até 2 horas" current={form.hoursAlone} onChange={update}>Até 2h</Choice>
            <Choice name="hoursAlone" value="3 a 5 horas" current={form.hoursAlone} onChange={update}>3–5h</Choice>
            <Choice name="hoursAlone" value="6 a 8 horas" current={form.hoursAlone} onChange={update}>6–8h</Choice>
            <Choice name="hoursAlone" value="Mais de 8 horas" current={form.hoursAlone} onChange={update}>Mais de 8h</Choice>
          </div>
        </div>

        <div className="adoption-fields-grid">
          <label className="field span-2">
            <span>Onde o animal ficará e dormirá? *</span>
            <textarea value={form.petStay} onChange={(e) => update("petStay", e.target.value)}
              placeholder="Conte onde ele ficará durante o dia e à noite." />
          </label>

          <label className="field">
            <span>Como será a rotina de passeios/brincadeiras?</span>
            <textarea value={form.exerciseRoutine} onChange={(e) => update("exerciseRoutine", e.target.value)}
              placeholder="Ex.: dois passeios por dia..." />
          </label>

          <label className="field">
            <span>O que fará com o animal em viagens?</span>
            <textarea value={form.travelPlan} onChange={(e) => update("travelPlan", e.target.value)}
              placeholder="Ex.: ficará com familiar..." />
          </label>
        </div>
      </section>

      <section className="adoption-form-section">
        <div className="form-section-heading">
          <span>06</span>
          <div>
            <h2>Experiência e decisão</h2>
            <p>Queremos entender a motivação e o compromisso com a adoção.</p>
          </div>
        </div>

        <div className="form-question">
          <strong>Você já foi responsável por um animal antes? *</strong>
          <div className="choice-grid">
            <Choice name="previousExperience" value="Sim" current={form.previousExperience} onChange={update}>Sim</Choice>
            <Choice name="previousExperience" value="Não" current={form.previousExperience} onChange={update}>Não</Choice>
          </div>
        </div>

        {form.previousExperience === "Sim" && (
          <label className="field full-field">
            <span>Conte brevemente sobre os animais que já teve</span>
            <textarea value={form.previousPetDetails} onChange={(e) => update("previousPetDetails", e.target.value)}
              placeholder="Quantos, por quanto tempo, o que aconteceu com eles..." />
          </label>
        )}

        <label className="field full-field">
          <span>Por que você quer adotar {animal.name}? *</span>
          <textarea value={form.adoptionReason} onChange={(e) => update("adoptionReason", e.target.value)}
            placeholder="Conte o que fez você se interessar por este animal e o que espera dessa adoção." />
        </label>

        <div className="form-question">
          <strong>Todas as pessoas da casa concordam com a adoção? *</strong>
          <div className="choice-grid">
            <Choice name="householdAgreement" value="Sim" current={form.householdAgreement} onChange={update}>Sim</Choice>
            <Choice name="householdAgreement" value="Não" current={form.householdAgreement} onChange={update}>Não</Choice>
            <Choice name="householdAgreement" value="Moro sozinho" current={form.householdAgreement} onChange={update}>Moro sozinho</Choice>
          </div>
        </div>

        <div className="form-question">
          <strong>Você está preparado para custos com alimentação, vacinas e atendimento veterinário? *</strong>
          <div className="choice-grid">
            <Choice name="financialCommitment" value="Sim" current={form.financialCommitment} onChange={update}>Sim</Choice>
            <Choice name="financialCommitment" value="Não" current={form.financialCommitment} onChange={update}>Não</Choice>
          </div>
        </div>

        <div className="form-question">
          <strong>Você entende que o animal pode precisar de período de adaptação e paciência? *</strong>
          <div className="choice-grid">
            <Choice name="adaptationCommitment" value="Sim" current={form.adaptationCommitment} onChange={update}>Sim</Choice>
            <Choice name="adaptationCommitment" value="Não" current={form.adaptationCommitment} onChange={update}>Não</Choice>
          </div>
        </div>

        <label className="field full-field">
          <span>Quer contar mais alguma coisa?</span>
          <textarea value={form.observations} onChange={(e) => update("observations", e.target.value)}
            placeholder="Informações que você considera importantes para a equipe saber." />
        </label>
      </section>

      <section className="adoption-form-section declaration-section">
        <div className="form-section-heading">
          <span>07</span>
          <div>
            <h2>Confirmação</h2>
            <p>Antes de enviar, confirme as informações abaixo.</p>
          </div>
        </div>

        <label className="declaration-check">
          <input type="checkbox" checked={form.responsibleAdult}
            onChange={(e) => update("responsibleAdult", e.target.checked)} />
          <span>Confirmo que sou maior de 18 anos e responsável pelas informações enviadas.</span>
        </label>

        <label className="declaration-check">
          <input type="checkbox" checked={form.contactConsent}
            onChange={(e) => update("contactConsent", e.target.checked)} />
          <span>Autorizo a equipe da Onda Animal a entrar em contato comigo sobre este pedido de adoção.</span>
        </label>

        <label className="declaration-check">
          <input type="checkbox" checked={form.housingPhotoConsent}
            onChange={(e) => update("housingPhotoConsent", e.target.checked)} />
          <span>Autorizo o uso das fotos da minha moradia exclusivamente para a análise desta solicitação de adoção.</span>
        </label>

        <div className="analysis-notice">
          <strong>O que acontece depois?</strong>
          <p>
            Sua solicitação ficará com status <b>Em análise</b>. A equipe avaliará
            as respostas junto às características de {animal.name} e entrará em
            contato. O formulário não gera aprovação automática.
          </p>
        </div>

        <button className="button primary adoption-submit-button" type="submit" disabled={sending}>
          {sending ? (sendingStage || "Enviando...") : "Enviar solicitação para análise"}
        </button>
      </section>
    </form>
  );
}
