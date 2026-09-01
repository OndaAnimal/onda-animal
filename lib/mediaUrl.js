export function isCloudinaryUrl(value) {
  return /^https:\/\/res\.cloudinary\.com\//i.test(String(value || ""));
}

export function mediaUrl(value, options = {}) {
  const url = String(value || "");
  if (!url || !isCloudinaryUrl(url)) return url;

  const marker = "/image/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;

  const {
    width,
    height,
    crop = "limit",
    gravity = "auto",
    quality = "auto",
  } = options;

  let tail = url.slice(index + marker.length);
  // URLs geradas pela V14 já podem conter este bloco básico.
  tail = tail.replace(/^f_auto,q_auto\//, "");

  const transforms = ["f_auto", `q_${quality}`];
  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (crop) transforms.push(`c_${crop}`);
  if (crop === "fill" && gravity) transforms.push(`g_${gravity}`);

  return `${url.slice(0, index)}${marker}${transforms.join(",")}/${tail}`;
}
