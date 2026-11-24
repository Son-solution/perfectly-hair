# Protected client demo (Phase 5A.2)

Goal: show the salon owner the updated website plus the Admin and Staff dashboards online.
The demo uses fictional data, is password-protected, is not indexed, and never touches
production.

## 1. Why our own password gate (Vercel plan check, 2026-11-24)

| Vercel option | Hobby (free) | Suitable for an external guest? |
| --- | --- | --- |
| Password Protection | **Not available** (Pro/Enterprise, paid add-on) | — |
| Vercel Authentication | Available | No. The guest needs a Vercel account; Hobby allows only one external user per account |
| Shareable Links | Available, **one link per account**, no expiry | Partly. Usable as an extra layer only, cannot expire |

**Result:** we use a server-side password gate. It costs nothing and needs no upgrade.

## 2. How it works

| Part | File |
| --- | --- |
| Switch (`DEMO_ENVIRONMENT=client-demo`), credentials from env, fail-closed check | `src/features/demo/config.ts` |
| HMAC-SHA256 signed, expiring session token, constant-time compare, rate limit | `src/features/demo/session.ts` |
| Gate for every request, `X-Robots-Tag: noindex`, `Cache-Control: private, no-store` | `src/proxy.ts` |
| Password page (server-rendered, works without JS) | `src/app/demo-zugang/page.tsx` |
| Login (POST) / Logout (POST) | `src/app/demo-zugang/login/route.ts`, `…/logout/route.ts` |
| Dashboards enabled only when the demo is ready | `src/features/dashboard/preview-gate.ts` (`demoReady`) |

### Security properties
- **Secrets only in environment variables.** Nothing is in the source code or on GitHub.
  `.env.*` is git-ignored.
- **Cookie `ph_demo_session`:**
  - HttpOnly, Secure, SameSite=Lax, Path=/.
  - Max-Age = `DEMO_SESSION_HOURS` (default 12 h, at most 72 h).
  - The token holds its own expiry, which is verified on the server.
- **Signature:**
  - Tampered or forged tokens are rejected.
  - Changing `DEMO_SESSION_SECRET` logs everyone out immediately.
- **Rate limit:**
  - 5 failed attempts per IP per 15 minutes, then lockout.
  - Each failed attempt waits about 0.8 s.
  - The counter is in memory per server instance (no paid store); the long random password is
    the main protection.
- **Fail-closed:** if `DEMO_ENVIRONMENT=client-demo` is set but the password (< 12 characters) or
  the secret (< 32 characters) is missing, **every** request gets 503.
- **No open redirect:** after login only relative, same-site paths are accepted.
- **Logout:** the "Abmelden" button in the dashboard header and in the floating bar on the website.
- **Not indexed:**
  - `X-Robots-Tag: noindex, nofollow, noarchive` on every response;
  - `<meta name="robots" content="noindex">`;
  - `robots.txt` with `Disallow: /`.
- **Production:** without `DEMO_ENVIRONMENT` the proxy returns immediately. `/demo-zugang`
  returns 404, the dashboards return 404, and nothing changes.

## 3. Vercel setup (one-time)

1. **Environment variables.** Go to Project → Settings → Environment Variables.
   - Environment: **Preview only**.
   - Git branch: **`client-demo`**.
   - Never set these for Production.

   | Name | Value |
   | --- | --- |
   | `DEMO_ENVIRONMENT` | `client-demo` |
   | `DEMO_ACCESS_PASSWORD` | long random password (≥ 12 characters) |
   | `DEMO_SESSION_SECRET` | random string (≥ 32 characters) |
   | `DEMO_SESSION_HOURS` | `12` (optional) |
2. **Vercel Authentication.** If "Vercel Authentication" (Standard Protection) is active for
   Preview deployments, the owner would need a Vercel account. Choose one:
   - **Option A:** disable it for Preview under Settings → Deployment Protection. Our password gate
     protects the demo.
   - **Option B:** keep it and share the single free Shareable Link as an extra layer.
3. Push the branch `client-demo`. Vercel builds a Preview deployment automatically. If you set
   the variables afterwards, start a redeploy. The variables are read at build time.
4. **Branch URL:** `https://<project>-git-client-demo-<team>.vercel.app`. It stays the same for
   every new push.

## 4. Sharing with the owner
- Send the link and the password **through separate channels**, for example the link by e-mail and
  the password by phone or SMS.
- **End the demo:** change `DEMO_SESSION_SECRET` (all sessions end immediately) and/or
  `DEMO_ACCESS_PASSWORD`, then redeploy. Alternatively delete the Preview deployment or the
  branch.

## 5. Not part of the demo
No Supabase, no real e-mails, no stored data. All interactions are local demo state and reset on
reload.
