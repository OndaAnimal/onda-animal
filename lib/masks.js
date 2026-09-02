export function onlyDigits(value = "") {
  return String(value ?? "").replace(/\D/g, "");
}

export function maskBrazilPhone(value = "") {
  let digits = onlyDigits(value);

  // Se o usuário colar +55, mostra apenas o telefone nacional no campo.
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const local = digits.slice(2);
  const mobile = local.startsWith("9");
  const firstSize = mobile ? 5 : 4;

  if (local.length <= firstSize) {
    return `(${ddd}) ${local}`;
  }

  return `(${ddd}) ${local.slice(0, firstSize)}-${local.slice(firstSize, firstSize + 4)}`;
}

export function maskYear(value = "") {
  return onlyDigits(value).slice(0, 4);
}

export function maskInteger(value = "", maxLength = 3) {
  return onlyDigits(value).slice(0, maxLength);
}

export function maskPin(value = "") {
  return onlyDigits(value).slice(0, 8);
}

export function maskCep(value = "") {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function maskCpf(value = "") {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}
