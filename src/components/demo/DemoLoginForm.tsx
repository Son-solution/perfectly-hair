import { PasswordField } from "./PasswordField";

/** Server-rendered login form — works without JavaScript (target and errors come from the URL). */
export function DemoLoginForm({ error = null, target = "/", loggedOut = false }: { error?: string | null; target?: string; loggedOut?: boolean }) {
  return (
    <form method="post" action="/demo-zugang/login" className="mt-10 space-y-5">
      <input type="hidden" name="weiter" value={target} />
      {error && (
        <div id="demo-err" role="alert" className="border border-white px-4 py-3 text-sm leading-relaxed text-white">
          {error === "gesperrt"
            ? "Zu viele Fehlversuche. Der Zugang ist für 15 Minuten gesperrt – bitte danach erneut versuchen."
            : "Das Passwort ist nicht korrekt. Bitte prüfen Sie Groß- und Kleinschreibung (mit „Anzeigen“ sichtbar machen)."}
        </div>
      )}
      <PasswordField invalid={!!error} />
      {loggedOut && !error && <p role="status" className="text-sm text-white/70">Sie wurden abgemeldet.</p>}
      <button type="submit" className="inline-flex min-h-12 w-full items-center justify-center bg-white px-7 text-[0.8125rem] font-medium uppercase tracking-[0.2em] text-ink hover:bg-mist">
        Vorschau öffnen
      </button>
      <p className="text-center text-xs text-white/50">Nicht öffentlich · wird nicht von Suchmaschinen erfasst</p>
    </form>
  );
}
