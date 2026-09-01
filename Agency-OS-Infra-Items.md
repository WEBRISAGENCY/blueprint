# Agency OS — Beta feedback: infrastructure & bigger-lift items

These are the beta-feedback items that are **not** quick UI fixes. Each one below
says what's actually going on, what I changed in code (if anything), and what
*you* need to do (mostly in Google Cloud Console — I can't click in your Google
account, and those are account-settings changes I shouldn't make on your behalf).

The four small code fixes for these are already on `staging` (commit `b864566`).
Everything still deploys the same way: merge `staging` → `main`, then the usual
`npm run migrate` (no new migration was needed for any of this).

---

## 1. Search Console — "This app is blocked"

**What's happening.** Two things stacked up:

1. *(code, now fixed)* The Integrations page had a single button — "Also grant
   Analytics & Search Console access" — that asked Google for **three** scopes at
   once, including `analytics.readonly`. That Analytics scope is **sensitive**,
   which forces Google verification. When our OAuth app isn't verified, Google
   blocks the *entire* consent screen — so even though Search Console
   (`webmasters.readonly`) is a harmless non-sensitive scope, bundling it with
   Analytics made the whole thing fail. That's the "app is blocked" the tester saw.
2. *(config, your action)* Our OAuth consent screen's **publishing status** and
   **test users** decide who can connect at all.

**What I changed.** Split that one button into two:
- **Grant Search Console access** → asks only for Drive + Search Console (both
  non-sensitive). This works in Production with **no verification**.
- **Grant Analytics access (needs verification)** → asks for Analytics on its own,
  clearly labeled, so it can never block Search Console again.

**What you need to do (Google Cloud Console → APIs & Services → OAuth consent screen):**
- For the 5 beta users *right now*: keep the app in **Testing** and add each
  beta user's Google email under **Test users**. They'll be able to connect
  immediately. ⚠️ Caveat: in Testing, Google **expires the connection every 7
  days**, so they'll periodically need to hit "Reconnect" (the app already warns
  them when a grant is >7 days old).
- To stop the weekly expiry: **Publish the app to Production**. For the
  non-sensitive scopes (Drive `drive.file`, Search Console `webmasters.readonly`)
  this needs **no** Google review — publishing is enough.
- Analytics (`analytics.readonly`) is the only sensitive scope. To let external
  users connect GA natively you'd submit the app for **OAuth verification**
  (brand info + scope justification + usually a demo video; review takes days to
  a few weeks). Until then, GA-native stays blocked — but note **GA and GSC data
  both already flow through Windsor.ai**, so nothing in reporting depends on the
  native Google grant today. This is optional.

**Bottom line:** add the beta users as Test users to unblock now; publish to
Production before/at launch to kill the 7-day expiry; Analytics verification is
optional and only needed if you ever want native GA (not Windsor) data.

---

## 2. Calendar — "you do not have permission to view them"

**What's happening.** The calendar panel is a **public Google Calendar embed**
(an `<iframe>` pointed at your email), not an API integration. That embed only
renders a *private* calendar when the same browser is (a) signed in to that exact
Google account and (b) allowing third-party cookies for `calendar.google.com`.
Modern browsers block third-party cookies by default, so the iframe is treated as
an anonymous visitor → your calendar is private → "you do not have permission."
It's a limitation of the embed approach, not a bug we can toggle off.

**What I changed.** Added a help note under the calendar explaining the cause and
the interim options (be signed in to that Google account + allow third-party
cookies for calendar.google.com, or click **Open ↗** to use Google Calendar
directly).

**The real fix (bigger lift — needs a decision).** Move off the iframe and read
the calendar through the **Google Calendar API** with a `calendar.readonly`
OAuth scope, then render events natively in the app. Upsides: works regardless of
cookie settings, and we control the look. Costs: it adds another Google scope
(`calendar.readonly` is sensitive → same verification consideration as Analytics),
plus building the events fetch + UI. Estimate: ~1–2 days. I'd hold this until
after launch unless the in-app calendar is a must-have for the beta. **Want me to
build it?**

---

## 3. "Add our own APIs / upload our own local map grids"

**What's being asked.** The tester wants to plug in their own tools instead of
ours for local rank tracking — specifically `gtrack.wiremo.co` in place of Local
Falcon, and uploading their own local map grids.

**Reality.** This is a genuine feature, not a fix. Today local grid data comes
from Local Falcon via our integration. Supporting an arbitrary third-party
provider means: a provider abstraction for local-grid data, a way to store each
agency's own API key/endpoint (we already have the encrypted per-agency
credential vault, so that part's cheap), an adapter that maps their data shape to
ours, and UI to configure + upload grids. Estimate: meaningful — call it several
days for one additional provider, more if it's meant to be fully "bring any API."

**Recommendation.** Don't block launch on this. If Wiremo/gtrack is a common ask,
scope it as a fast-follow: I'd start by adding *gtrack specifically* as a second
local-grid provider (bounded, testable) rather than a generic "any API" system,
which is a much larger surface. **Say the word and I'll spec it.**

---

## 4. Force-deleting a client that has a project attached

**What's happening.** This is **working as designed**, not a bug. Deleting a
client that still has a project/sprints/deliverables attached is blocked to
prevent orphaned work and accidental data loss; the app offers **Mark inactive**
instead (which hides it from the roster while preserving history).

**Options if you want to change it:**
- *Keep as-is (recommended):* "Mark inactive" is the safe path; true deletes are
  rare and dangerous.
- *Add an explicit "Delete client and everything attached" confirm:* a
  cascade-delete behind a strong, typed confirmation ("type the client name to
  delete N projects, M tasks…"). Low effort, but it's a genuinely destructive
  action — I'd gate it to Admins only.

**Recommendation.** Leave it for launch. If you want the hard-delete escape hatch,
I'll add the Admin-only typed-confirmation cascade. **Your call.**

---

## 5. Drive Picker — "Choose from Drive… API developer key is invalid"

**What's happening.** The "Choose from Drive…" flow uses Google's Drive Picker,
which authenticates with a browser API key we pass as `GOOGLE_PICKER_API_KEY`.
The key is set, but Google is rejecting it — which almost always means one of two
config problems on the key itself, not a bug in our code:
- the **Google Picker API isn't enabled** for the project that owns the key, or
- the key has **HTTP-referrer / domain restrictions** that don't include the
  app's domain, so Google refuses to serve the picker on our origin.

**What you need to do (Google Cloud Console, same project as the OAuth app):**
- **APIs & Services → Library →** enable the **Google Picker API**.
- **APIs & Services → Credentials →** open the key used for
  `GOOGLE_PICKER_API_KEY`. Under **Application restrictions**, either set it to
  **None** or, if you keep **HTTP referrers**, add the app's domain(s) (the
  production domain and any preview/localhost origins you test from). Under **API
  restrictions**, make sure **Google Picker API** is in the allowed list.

Once the picker loads, the Drive-folder features below unblock automatically —
no redeploy needed on my side.

## 6. Auto-created client folder lands at Drive root / pick a parent folder

**What's happening.** When the app creates a client's Drive folder it lands at
the **root** of the connected Drive. That's a direct consequence of the OAuth
scope we use: `drive.file` only lets the app see and manage **folders it created
itself** — it can't "see" a pre-existing "Clients" folder to nest new folders
inside. To place new client folders under an existing parent, the user has to
**pick that parent through the Drive Picker** (which grants the app access to
just that one folder). So this is **blocked by item 5** — the picker has to work
first.

**Sequence:** fix the picker key (item 5) → then I add a **"parent folder"
setting** so new client folders are created inside the folder you pick, instead
of at the Drive root. **This one's on me once the picker's live** — no further
Google config needed after item 5.

## 7. Task owner shows a generic icon, not the person's photo

**What's happening.** In the tasks table the owner avatar falls back to a plain
initial/'?' circle instead of the teammate's real profile picture. Owner photos
come from **Clerk** (each member's profile image). Two parts:
- *(config, your action)* Team members need a **profile photo set on their Clerk
  account** for a real picture to exist to show. If a member has no image in
  Clerk, there's nothing for the app to render.
- *(code, on me)* I can improve the fallback so that when there's no photo it
  shows the person's **colored initials** (like the subtask owner picker already
  does) instead of a generic '?' icon — a nicer default either way.

**What you need to do:** confirm your beta team members have profile images in
Clerk (or that Clerk is pulling them from Google SSO). **What I'll do:** ship the
initials-fallback avatar so it never looks broken when a photo is missing. **Want
me to do that now?**

---

### Summary of what needs *you* vs. *me*

| Item | Code (done) | Needs you | Needs me (if you want) |
|---|---|---|---|
| Search Console block | ✅ scope split | Add beta test users / publish to Production | Analytics verification support (optional) |
| Calendar permission | ✅ help note | (interim) sign in + allow cookies | Build native Calendar API view (~1–2d) |
| Own APIs / map grids | — | Decide if it's a launch blocker | Spec + build gtrack provider (fast-follow) |
| Force-delete client | — | Decide keep-as-is vs hard delete | Admin-only cascade delete |
| Drive Picker "key invalid" | — | Enable Picker API + fix key restrictions | (unblocks once key works) |
| Client folder at Drive root | — | (after picker works) | Add "parent folder" setting |
| Owner shows generic icon | — | Ensure team have Clerk photos | Ship initials-fallback avatar |
