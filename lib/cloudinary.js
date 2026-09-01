import "server-only";
import crypto from "crypto";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

function config() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET."
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function signature(params, apiSecret) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${serialized}${apiSecret}`)
    .digest("hex");
}

export function sanitizeMediaKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/-+/g, "-")
    .slice(0, 180);
}


export function createCloudinarySignedUpload(publicId) {
  const { cloudName, apiKey, apiSecret } = config();
  const safePublicId = sanitizeMediaKey(publicId);
  if (!safePublicId) throw new Error("Destino da imagem inválido.");

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    invalidate: "true",
    overwrite: "true",
    public_id: safePublicId,
    timestamp,
  };

  return {
    cloudName,
    apiKey,
    timestamp,
    publicId: safePublicId,
    signature: signature(signedParams, apiSecret),
    uploadUrl: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
  };
}

export async function uploadCloudinaryImage(file, publicId) {
  const { cloudName, apiKey, apiSecret } = config();

  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("Arquivo de imagem inválido.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("A imagem é muito grande. O limite é 12 MB por arquivo.");
  }

  if (file.type && !file.type.startsWith("image/")) {
    throw new Error("Envie apenas arquivos de imagem.");
  }

  const safePublicId = sanitizeMediaKey(publicId);
  if (!safePublicId) {
    throw new Error("Destino da imagem inválido.");
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signedParams = {
    invalidate: "true",
    overwrite: "true",
    public_id: safePublicId,
    timestamp,
  };

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("public_id", safePublicId);
  form.append("overwrite", "true");
  form.append("invalidate", "true");
  form.append("signature", signature(signedParams, apiSecret));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: "POST", body: form }
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error?.message || "Cloudinary recusou o upload da imagem.");
  }

  const optimizedUrl = String(body.secure_url || "").replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto/"
  );

  return {
    url: optimizedUrl || body.secure_url,
    secureUrl: body.secure_url,
    publicId: body.public_id,
    width: body.width,
    height: body.height,
    format: body.format,
    bytes: body.bytes,
  };
}
