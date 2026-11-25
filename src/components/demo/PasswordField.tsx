"use client";

import { useEffect, useState } from "react";

/**
 * Password input tuned for phone keyboards: no auto-capitalisation/autocorrect/spellcheck and
 * an optional "show password" toggle so the owner can check a long, case-sensitive password.
 * Works without JavaScript too (then it is a normal password field).
 */
export function PasswordField({ invalid }: { invalid: boolean }) {
  const [show, setShow] = useState(false);
  const [cookiesBlocked, setCookiesBlocked] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability check after mount
  useEffect(() => { setCookiesBlocked(!navigator.cookieEnabled); }, []);
  return (
    <div>
      <label htmlFor="demo-pw" className="text-eyebrow uppercase text-white/60">Zugangspasswort</label>
      <div className="mt-3 flex items-end gap-3 border-b border-white/40 focus-within:border-white">
        <input
          id="demo-pw"
          name="passwort"
          type={show ? "text" : "password"}
          required
          autoComplete="current-password"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-invalid={invalid}
          aria-describedby={invalid ? "demo-err demo-hint" : "demo-hint"}
          className="block min-w-0 flex-1 bg-transparent py-3 text-lg outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-pressed={show}
          aria-controls="demo-pw"
          className="shrink-0 pb-3 text-xs uppercase tracking-[0.14em] text-white/70 underline-offset-4 hover:text-white hover:underline"
        >
          {show ? "Verbergen" : "Anzeigen"}
        </button>
      </div>
      <p id="demo-hint" className="mt-2 text-xs text-white/50">Groß- und Kleinschreibung beachten.</p>
      {cookiesBlocked && (
        <p role="alert" className="mt-3 border border-white px-4 py-3 text-sm text-white">
          Ihr Browser blockiert Cookies. Die Anmeldung benötigt ein Sitzungs-Cookie – bitte Cookies erlauben oder den Link in Safari bzw. Chrome öffnen.
        </p>
      )}
    </div>
  );
}
