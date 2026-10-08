const LEGACY_AUTO_AGE_START = "2026-10-08";

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function dateOnly(value) {
  if (!value) return "";
  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
}

function validDateParts(value) {
  const clean = dateOnly(value);
  const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  return { year, month, day };
}

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function fullMonthsBetween(referenceDate, currentDate = new Date()) {
  const ref = validDateParts(referenceDate);
  if (!ref) return 0;

  const current = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    day: currentDate.getDate(),
  };

  let months = (current.year - ref.year) * 12 + (current.month - ref.month);
  const anniversaryDay = Math.min(ref.day, daysInMonth(current.year, current.month));

  if (current.day < anniversaryDay) months -= 1;
  return Math.max(0, months);
}

export function parseAnimalAge(value) {
  const original = String(value || "").trim();
  if (!original) return null;

  const text = normalize(original);
  const approximate = /\b(aprox|aproximad|cerca)\b/.test(text);

  const yearsMatch = text.match(/(\d+)\s*(ano|anos)\b/);
  const monthsMatch = text.match(/(\d+)\s*(mes|meses)\b/);

  const years = yearsMatch ? Number(yearsMatch[1]) : 0;
  const months = monthsMatch ? Number(monthsMatch[1]) : 0;

  if (!yearsMatch && !monthsMatch) return null;

  return {
    baseMonths: Math.max(0, years * 12 + months),
    precision: monthsMatch ? "months" : "years",
    approximate,
  };
}

export function formatAnimalAgeMonths(totalMonths, precision = "months", approximate = false) {
  const prefix = approximate ? "Aprox. " : "";

  if (precision === "years") {
    const years = Math.max(0, Math.floor(totalMonths / 12));
    return `${prefix}${years} ${years === 1 ? "ano" : "anos"}`;
  }

  const months = Math.max(0, Math.floor(totalMonths));

  if (months < 12) {
    return `${prefix}${months} ${months === 1 ? "mês" : "meses"}`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (!remainingMonths) {
    return `${prefix}${years} ${years === 1 ? "ano" : "anos"}`;
  }

  return `${prefix}${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`;
}

export function getAnimalAgeReferenceDate(animal) {
  return (
    dateOnly(animal?.ageReferenceDate) ||
    dateOnly(animal?.registeredAt) ||
    dateOnly(animal?.createdAt) ||
    LEGACY_AUTO_AGE_START
  );
}

export function getAnimalDisplayAge(animal, currentDate = new Date()) {
  if (!animal) return "";

  const storedBase = Number(animal.ageBaseMonths);
  const parsed = parseAnimalAge(animal.age);

  if (!Number.isFinite(storedBase) && !parsed) {
    return String(animal.age || "");
  }

  const baseMonths = Number.isFinite(storedBase)
    ? Math.max(0, storedBase)
    : parsed.baseMonths;

  const precision =
    animal.agePrecision === "months" || animal.agePrecision === "years"
      ? animal.agePrecision
      : parsed.precision;

  const approximate =
    typeof animal.ageApproximate === "boolean"
      ? animal.ageApproximate
      : parsed.approximate;

  const elapsedMonths = fullMonthsBetween(getAnimalAgeReferenceDate(animal), currentDate);

  // Idades informadas apenas em anos avançam somente no aniversário
  // da data de referência. Ex.: 7 anos -> 8 anos após 12 meses.
  if (precision === "years") {
    const baseYears = Math.floor(baseMonths / 12);
    const currentYears = baseYears + Math.floor(elapsedMonths / 12);
    return formatAnimalAgeMonths(currentYears * 12, "years", approximate);
  }

  return formatAnimalAgeMonths(baseMonths + elapsedMonths, "months", approximate);
}

export function prepareAnimalAgeForSave(animal, previousAnimal = null, currentDate = new Date()) {
  const today = [
    currentDate.getFullYear(),
    String(currentDate.getMonth() + 1).padStart(2, "0"),
    String(currentDate.getDate()).padStart(2, "0"),
  ].join("-");

  const parsed = parseAnimalAge(animal?.age);
  const createdAt =
    previousAnimal?.createdAt ||
    animal?.createdAt ||
    currentDate.toISOString();

  const registeredAt =
    previousAnimal?.registeredAt ||
    animal?.registeredAt ||
    createdAt;

  if (!parsed) {
    return {
      ...animal,
      createdAt,
      registeredAt,
      ageReferenceDate:
        previousAnimal?.ageReferenceDate ||
        animal?.ageReferenceDate ||
        dateOnly(registeredAt) ||
        today,
    };
  }

  return {
    ...animal,
    createdAt,
    registeredAt,
    ageBaseMonths: parsed.baseMonths,
    agePrecision: parsed.precision,
    ageApproximate: parsed.approximate,
    ageReferenceDate: today,
  };
}

export function isAnimalAgeAutomatic(animal) {
  return Boolean(
    animal &&
    (Number.isFinite(Number(animal.ageBaseMonths)) || parseAnimalAge(animal.age))
  );
}
