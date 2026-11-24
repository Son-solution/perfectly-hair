/** Server-rendered login form — works without JavaScript (target and errors come from the URL). */
export function DemoLoginForm({ error = null, target = "/", loggedOut = false }: { error?: string | null; target?: string; loggedOut?: boolean }) {
  return (
    <form method="post" action="/demo-zugang/login" className="mt-10 space-y-5">
      <input type="hidden" name="weiter" value={target} />
      <div>
        <label htmlFor="demo-pw" className="text-eyebrow uppercase text-white/60">Zugangspasswort</label>
        <input
          id="demo-pw"
          name="passwort"
          type="password"
          required
          autoComplete="current-password"
          autoFocus
          aria-invalid={!!error}
          aria-describedby={error ? "demo-err" : undefined}
          className="mt-3 block w-full border-b border-white/40 bg-transparent py-3 text-lg outline-none focus:border-white"
        />
      </div>
      {error && (
        <p id="demo-err" role="alert" className="text-sm text-white">
          — {error === "gesperrt" ? "Zu viele Versuche. Bitte in 15 Minuten erneut versuchen." : "Das Passwort ist nicht korrekt."}
        </p>
      )}
      {loggedOut && !error && <p role="status" className="text-sm text-white/70">Sie wurden abgemeldet.</p>}
      <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center bg-white px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-ink hover:bg-mist">
        Vorschau öffnen
      </button>
      <p className="text-center text-xs text-white/50">Nicht öffentlich · wird nicht von Suchmaschinen erfasst</p>
    </form>
  );
}
