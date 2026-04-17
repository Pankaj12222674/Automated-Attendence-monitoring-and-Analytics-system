export function buildFallbackAvatar(name = "User") {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "User"
  )}&background=0ea5e9&color=fff`;
}

function getApiBase() {
  return (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
}

export function resolveProfileImage(profileImage, name = "User") {
  if (typeof profileImage !== "string") {
    return buildFallbackAvatar(name);
  }

  const normalized = profileImage.trim();

  if (!normalized) {
    return buildFallbackAvatar(name);
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("//")) {
    return `https:${normalized}`;
  }

  if (normalized.startsWith("/")) {
    return `${getApiBase()}${normalized}`;
  }

  return `${getApiBase()}/${normalized.replace(/^\/+/, "")}`;
}
