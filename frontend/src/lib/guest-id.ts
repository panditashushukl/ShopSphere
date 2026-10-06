const GUEST_COOKIE_NAME = "shopsphere_guest_id";

export function getGuestId(): string {
  if (typeof window === "undefined") return "guest";

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, val] = cookie.split("=");
    if (name === GUEST_COOKIE_NAME && val) {
      return decodeURIComponent(val);
    }
  }

  const newGuestId = `guest_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${GUEST_COOKIE_NAME}=${encodeURIComponent(newGuestId)}; expires=${expires}; path=/; SameSite=Lax`;

  return newGuestId;
}
