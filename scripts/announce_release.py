#!/usr/bin/env python3
"""Announce new Agency OS release pages to Slack and the ActiveCampaign list.

Run by .github/workflows/announce-release.yml when a push adds a new
release-notes/<date-slug>/index.html. Standard library only.

Usage:
  announce_release.py release-notes/2026-11-04-website-quality-audit/index.html [...]
  announce_release.py --dry-run <path>   # print the Slack post and email, send nothing

Environment (GitHub repository secrets):
  SLACK_WEBHOOK_URL   Incoming webhook for the Blueprint member channel
  AC_API_URL          e.g. https://youraccount.api-us1.com
  AC_API_KEY          ActiveCampaign API key (Settings > Developer)
  AC_LIST_ID          ID of the whole Blueprint list
  AC_FROM_EMAIL       Sender address, e.g. ryan@theblueprint.training
  AC_FROM_NAME        Sender name, e.g. Ryan Stewart
"""
import html, json, os, re, sys, time, urllib.parse, urllib.request

SITE = "https://theblueprint.training"
SKIP_SECTIONS = {"Every change in this release window"}


def strip(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def parse(path):
    src = open(path, encoding="utf-8").read()
    slug = path.replace("\\", "/").split("release-notes/")[1].split("/")[0]
    title = strip(re.search(r"<h1>(.*?)</h1>", src, re.S).group(1))
    date = strip(re.search(r'<div class="meta">.*?<span>Agency OS</span><span>(.*?)</span>', src, re.S).group(1))
    lead = strip(re.search(r'<p class="lead">(.*?)</p>', src, re.S).group(1))
    sections = []
    for m in re.finditer(r'<div class="rn-sec"[^>]*><h2>(.*?)</h2>(.*?)</div>(?=<div class="rn-sec"|</div>\s*<div class="rn-nav")', src, re.S):
        h2, rest = m.group(1), m.group(2)
        tag = re.search(r'<span class="rn-tag[^"]*">(.*?)</span>', h2)
        heading = strip(re.sub(r'<span class="rn-tag[^"]*">.*?</span>', "", h2))
        if heading in SKIP_SECTIONS:
            continue
        ul = re.search(r"<ul>(.*?)</ul>", rest, re.S)
        bullets = [strip(li) for li in re.findall(r"<li>(.*?)</li>", ul.group(1), re.S)] if ul else []
        sections.append({"tag": strip(tag.group(1)) if tag else "", "heading": heading, "bullets": bullets})
    return {"slug": slug, "title": title, "date": date, "lead": lead, "sections": sections,
            "url": f"{SITE}/release-notes/{slug}/"}


def slack_payload(r):
    lines = [f"*{s['heading']}*" + (f"  _{s['tag']}_" if s["tag"] else "") + "\n" + "\n".join(f"• {b}" for b in s["bullets"]) for s in r["sections"]]
    blocks = [
        {"type": "header", "text": {"type": "plain_text", "text": f"New in Agency OS: {r['title']}"[:150]}},
        {"type": "section", "text": {"type": "mrkdwn", "text": r["lead"]}},
    ]
    for chunk in lines:
        blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": chunk[:2900]}})
    blocks.append({"type": "actions", "elements": [{"type": "button", "text": {"type": "plain_text", "text": "Read the release notes"}, "url": r["url"], "style": "primary"}]})
    return {"text": f"New in Agency OS: {r['title']} {r['url']}", "blocks": blocks[:50]}


def email_html(r):
    e = html.escape
    secs = ""
    for s in r["sections"]:
        tag = f'<span style="font:700 11px Arial,sans-serif;letter-spacing:1.5px;text-transform:uppercase;background:#0B0E1A;color:#F7C600;padding:3px 7px;border-radius:3px">{e(s["tag"])}</span>&nbsp; ' if s["tag"] else ""
        lis = "".join(f'<li style="margin:0 0 8px">{e(b)}</li>' for b in s["bullets"])
        secs += f'<h2 style="font:700 20px Arial,sans-serif;color:#0B0E1A;margin:28px 0 10px">{tag}{e(s["heading"])}</h2><ul style="padding-left:20px;margin:0;color:#374151;font:16px/1.55 Arial,sans-serif">{lis}</ul>'
    return f'''<!DOCTYPE html><html><body style="margin:0;background:#F7F8FA">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F8FA"><tr><td align="center" style="padding:24px 12px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px">
<tr><td style="background:#0B0E1A;padding:18px 28px;border-radius:10px 10px 0 0;font:700 13px Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#F7C600">Agency OS release notes &middot; {e(r["date"])}</td></tr>
<tr><td style="padding:28px">
<h1 style="font:800 30px/1.15 Arial,sans-serif;color:#0B0E1A;margin:0 0 12px">{e(r["title"])}</h1>
<p style="font:17px/1.55 Arial,sans-serif;color:#4B5563;margin:0">{e(r["lead"])}</p>
{secs}
<p style="margin:32px 0 8px"><a href="{r["url"]}" style="display:inline-block;background:#F7C600;color:#0B0E1A;font:700 16px Arial,sans-serif;text-decoration:none;padding:14px 24px;border-radius:6px">Read the full release notes &rarr;</a></p>
<p style="font:14px/1.5 Arial,sans-serif;color:#6B7280;margin:20px 0 0">Every smaller change is in the <a href="{SITE}/release-notes/#changelog" style="color:#0B0E1A">detailed changelog</a>.</p>
</td></tr></table>
<p style="font:12px Arial,sans-serif;color:#9CA3AF;margin:16px 0">The Blueprint Training &middot; <a href="%UNSUBSCRIBELINK%" style="color:#9CA3AF">Unsubscribe</a></p>
</td></tr></table></body></html>'''


def post(url, data, form=False):
    body = urllib.parse.urlencode(data).encode() if form else json.dumps(data).encode()
    req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/x-www-form-urlencoded" if form else "application/json"})
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read().decode()


def wait_live(url, minutes=15):
    for _ in range(minutes * 4):
        try:
            with urllib.request.urlopen(url, timeout=20) as res:
                if res.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(15)
    return False


def send_slack(r):
    hook = os.environ.get("SLACK_WEBHOOK_URL")
    if not hook:
        print("SLACK_WEBHOOK_URL not set, skipping Slack"); return
    print("Slack:", post(hook, slack_payload(r)))


def send_email(r):
    base, key, lst = (os.environ.get(k) for k in ("AC_API_URL", "AC_API_KEY", "AC_LIST_ID"))
    if not (base and key and lst):
        print("ActiveCampaign secrets not set, skipping email"); return
    api = base.rstrip("/") + "/admin/api.php"
    subject = f"New in Agency OS: {r['title']}"
    common = {"api_key": key, "api_output": "json"}
    msg = json.loads(post(api + "?api_action=message_add", {**common,
        "format": "html", "subject": subject, "fromemail": os.environ["AC_FROM_EMAIL"],
        "fromname": os.environ.get("AC_FROM_NAME", "The Blueprint Training"), "reply2": os.environ["AC_FROM_EMAIL"],
        "priority": "3", "charset": "utf-8", "encoding": "quoted-printable", "htmlconstructor": "editor",
        "html": email_html(r), "textconstructor": "editor",
        "text": f"{r['title']}\n\n{r['lead']}\n\nRead the release notes: {r['url']}\n\nUnsubscribe: %UNSUBSCRIBELINK%",
        f"p[{lst}]": lst}, form=True))
    if str(msg.get("result_code")) != "1":
        sys.exit(f"ActiveCampaign message_add failed: {msg}")
    mid = msg["id"]
    camp = json.loads(post(api + "?api_action=campaign_create", {**common,
        "type": "single", "name": f"Release notes: {r['title']} ({r['slug'][:10]})",
        "sdate": time.strftime("%Y-%m-%d %H:%M:%S"), "status": "1", "public": "1", "tracklinks": "all",
        f"p[{lst}]": lst, f"m[{mid}]": "100"}, form=True))
    if str(camp.get("result_code")) != "1":
        sys.exit(f"ActiveCampaign campaign_create failed: {camp}")
    print("ActiveCampaign campaign sent:", camp.get("id"))


def main(argv):
    dry = "--dry-run" in argv
    paths = [a for a in argv if not a.startswith("--")]
    for p in paths:
        r = parse(p)
        if not r["sections"]:
            sys.exit(f"No release sections found in {p}")
        if dry:
            print(json.dumps(slack_payload(r), indent=2)); print(email_html(r)); continue
        if not wait_live(r["url"]):
            sys.exit(f"{r['url']} never went live; not announcing")
        send_slack(r)
        send_email(r)


if __name__ == "__main__":
    main(sys.argv[1:])
