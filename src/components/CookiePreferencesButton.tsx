"use client";

export function CookiePreferencesButton() {
  return (
    <button
      className="footer-link-button"
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent("essential:open-consent-preferences"),
        )
      }
    >
      Cookie preferences
    </button>
  );
}
