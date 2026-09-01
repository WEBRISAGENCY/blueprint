# Agency OS — Beta Onboarding (15-min live walkthrough)

**Goal for the session:** every user leaves with **1 client added, their brand on it, and a live report on screen.** That's the "aha." Everything else is secondary.

**Frame it up front (say this):** "This is a working beta. A couple of features are labeled Beta on purpose. Your job today is to get set up and start poking — the checklist on your dashboard is our map for the next 15 minutes."

---

## Before the call — tell them to bring these (send the day before)

- **Windsor.ai account** with at least one client's **GA4 + Search Console + GBP** already connected inside Windsor (this is the #1 thing that blocks reports — see gotcha below).
- **One real client** to set up: name, website, and the account IDs (GA4 property, GSC property, GBP location, Google Ads, Meta).
- **Their logo file + brand hex color** (for white-label).
- A **spreadsheet/CRM export** of clients if they want to bulk-import.
- Nothing extra for AI analysis — it runs on their **own Claude plan** once they connect Claude (Step 7). No separate key or bill.

---

## Run of show (≈15 min)

**0:00–2:00 — Sign up → name your agency → land on the dashboard**
- They sign up, then hit "Name your agency" (that name *is* their workspace).
- Land on the dashboard. Point at the **Get started** card: "7 steps, progress bar up top. We do these together now."

**2:00–3:00 — Step 1: Add yourself to the team**
- Settings → Team, add yourself with the **exact email you signed in with.**
- Say why: "This is what powers your personal *Me* view, task assignments, and @mentions. Skip it and your dashboard nags you."

**3:00–4:30 — Step 2: Brand your agency (white-label)**
- Settings → Agency profile: upload logo + set brand color.
- Payoff line: "Every client report and the app accent now carry *your* brand, not ours. This is what you show clients."

**4:30–7:30 — Step 3: Connect your data providers** *(the important one — go slow)*
- Settings → Integrations. Add **Windsor.ai** first (Search Console, GA4, GBP, ads all broker through it), then Ahrefs / Local Falcon / DataForSEO as they have them.
- **Say the gotcha out loud:** "Typing an account ID into Agency OS does **not** connect it. It only tells us *which* Windsor account to read. The source has to already be connected **inside Windsor**. If a report section is empty, that's almost always 'not connected in Windsor,' not a bug."

**7:30–9:30 — Step 4: Add your first client**
- Data tab / Import. Three paths: **onboard with Claude** (paste the prompt, it maps a spreadsheet/CRM export), the **template**, or add one manually.
- For the live demo, add **one** client by hand so everyone sees the fields.
- On the client's **Data tab**, set the report type (lead-gen vs e-commerce) and paste the account IDs.

**9:30–11:00 — Step 5: Create a project plan**
- Apply a plan template to the client → sprints, tasks, deliverables auto-schedule.
- "This is your delivery backbone — it feeds the Today dashboard and the client's work."

**11:00–13:30 — Step 6: Generate a client report** *(the money moment)*
- Open the client → report. Hit **↻ Refresh** to pull live from Windsor (first pull takes a bit — set expectations).
- Show off: sub-tabs (Organic / Paid Search / Paid Social), **date-range presets** on the charts, **branded vs non-branded** search tabs, the **Sections** filter to hide what they don't run, and the **Share** link (white-labeled, client-facing).
- Point at **Generate analysis (Beta)** — "AI reads the report and tells you what's working, what's not, and why, running on your own Claude plan (no separate key or bill). It needs Claude connected — Step 7 — so we'll actually run it in a minute."

**13:30–14:30 — Step 7: Connect Claude in chat**
- Settings → Connectors: add the MCP URL to Claude Desktop / claude.ai.
- "This lets you run the whole agency by chatting — 'pull me the report for X', 'add this client.'"
- "It also powers the **Generate analysis** button — AI report analysis on your own Claude plan, no extra key or bill." Now jump back and run one analysis so they see the payoff.

**14:30–15:00 — Wrap**
- "Finish any unchecked steps this week with a second real client. The card tracks your progress."
- Tell them **how to send feedback** (thumbs, Slack, wherever you want it).
- Name the Beta edges so nothing surprises them (see below).

---

## Gotchas to pre-empt (keep this cheat-sheet handy)

- **Empty report section = 'not connected in Windsor,'** not broken. Connect the source in Windsor first.
- **Reports read from a cache** — new data/settings show after you hit **Refresh** (and after a deploy for new features).
- **"Me" view blank** = your login email doesn't match a team member. Fix in Settings → Team.
- **AI analysis runs on their connected Claude plan** (via Step 7 — no separate key or bill). It's **Beta** — sanity-check before sending output to clients.
- **LSA / a specific ad account not pulling?** It has to be connected in Windsor like everything else.
- **Search Console history** tops out ~15 months (Google's limit), so the longest date preset is capped there.

## What "fully onboarded" looks like
All 7 checklist items green: you're on the team, branded, data connected, one client in, a plan applied, a live report generated, and (optionally) Claude connected in chat.
