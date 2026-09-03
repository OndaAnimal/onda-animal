export async function apiJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "Erro de comunicação.");
    error.status = response.status;
    error.detail = body.detail;
    throw error;
  }
  return body.data ?? body;
}

export function fetchPublicResource(resource, fallback) {
  return apiJson(`/api/public/${resource}`).catch((error) => {
    console.error(`Falha ao carregar ${resource}`, error);
    return fallback;
  });
}

export function submitAdoptionApplication(application) {
  return apiJson("/api/applications", {
    method: "POST",
    body: JSON.stringify(application),
  });
}

export function submitSiteFeedback(data) {
  return apiJson("/api/feedback", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function adminSession() {
  return fetch("/api/admin/session", { cache: "no-store" })
    .then((response) => response.json())
    .then((body) => Boolean(body.authenticated))
    .catch(() => false);
}

export function adminLogin(pin) {
  return apiJson("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ pin }),
  });
}

export function adminLogout() {
  return apiJson("/api/admin/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function loadAdminState() {
  return apiJson("/api/admin/state");
}

export function adminAction(action, payload = {}) {
  return apiJson("/api/admin/state", {
    method: "POST",
    body: JSON.stringify({ action, ...payload }),
  });
}

export function getConnectConversation(id) {
  if (!id) return Promise.resolve(null);
  return apiJson(`/api/connect?id=${encodeURIComponent(id)}`).catch((error) => {
    if (error.status === 404) return null;
    throw error;
  });
}

export function connectAction(action, payload = {}) {
  return apiJson("/api/connect", {
    method: "POST",
    body: JSON.stringify({ action, ...payload }),
  });
}


export async function uploadAdminImage(file, { scope, key }) {
  const form = new FormData();
  form.append("file", file);
  form.append("scope", scope);
  form.append("key", key);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    body: form,
    cache: "no-store",
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error || "Erro no upload da imagem.");
    error.status = response.status;
    error.detail = body.detail;
    throw error;
  }

  return body.data ?? body;
}

export async function uploadAdoptionImage(file, { applicationId, animalSlug, category, index }) {
  if (!file) throw new Error("Selecione uma imagem.");
  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Envie apenas arquivos de imagem.");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Cada imagem pode ter no máximo 12 MB.");
  }

  const signed = await apiJson("/api/uploads/adoption", {
    method: "POST",
    body: JSON.stringify({ applicationId, animalSlug, category, index }),
  });

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", signed.timestamp);
  form.append("public_id", signed.publicId);
  form.append("overwrite", "true");
  form.append("invalidate", "true");
  form.append("signature", signed.signature);

  const response = await fetch(signed.uploadUrl, { method: "POST", body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || "Não foi possível enviar a foto da moradia.");
  }

  const optimizedUrl = String(body.secure_url || "").replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto/"
  );

  return {
    url: optimizedUrl || body.secure_url,
    publicId: body.public_id,
    width: body.width,
    height: body.height,
  };
}
