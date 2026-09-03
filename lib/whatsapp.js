export function normalizeBrazilWhatsApp(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

export function adoptionWhatsAppUrl(value, { animalName = "", contactName = "Luise" } = {}) {
  const number = normalizeBrazilWhatsApp(value);
  if (!number) return "";

  const person = contactName || "responsável pelas adoções";
  const message = animalName
    ? `Olá, ${person}! Vi o perfil de ${animalName} no site da Onda Animal e gostaria de falar sobre a adoção.`
    : `Olá, ${person}! Vim pelo site da Onda Animal e gostaria de falar sobre adoção.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}


export function clinicWhatsAppUrl(value, { city = "", service = "", professional = "" } = {}) {
  const number = normalizeBrazilWhatsApp(value);
  if (!number) return "";

  const unit = city ? ` na unidade ${city}` : "";
  const serviceText = service ? ` o serviço de ${service}` : " um atendimento";
  const professionalText = professional ? ` com ${professional}` : "";
  const message = `Olá! Vim pelo site da Onda Animal e gostaria de agendar${serviceText}${professionalText}${unit}.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
