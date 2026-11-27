"""Prerender test — ONE page only (Disneyland). Read-only: does not modify the app.
Loads the live preview page in a headless browser, waits for full render,
then saves the final HTML (what Google/AI crawlers would receive with prerendering).
"""
import os, re, json
from playwright.sync_api import sync_playwright

URL = "https://gps-super-admin.preview.emergentagent.com/disneyland-paris-transfer"
OUT_DIR = "/app/prerender-test"
os.makedirs(OUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(args=["--no-sandbox"])
    page = browser.new_page(viewport={"width": 1280, "height": 900})
    page.goto(URL, wait_until="networkidle", timeout=60000)
    page.wait_for_selector("h1", timeout=20000)
    page.wait_for_timeout(2000)
    html = page.content()
    title = page.title()
    desc = page.eval_on_selector('meta[name="description"]', 'el => el ? el.content : ""') if page.query_selector('meta[name="description"]') else ""
    canonical = page.eval_on_selector('link[rel="canonical"]', 'el => el ? el.href : ""') if page.query_selector('link[rel="canonical"]') else ""
    h1 = page.inner_text("h1")
    root_children = page.eval_on_selector('#root', 'el => el.children.length')
    ldjson = page.eval_on_selector_all('script[type="application/ld+json"]', 'els => els.map(e => { try { return JSON.parse(e.textContent)["@type"]; } catch(x){ return "?"; } })')
    hreflang = page.eval_on_selector_all('link[rel="alternate"][hreflang]', 'els => els.map(e => e.getAttribute("hreflang"))')
    browser.close()

out_file = os.path.join(OUT_DIR, "disneyland-paris-transfer.html")
with open(out_file, "w") as f:
    f.write(html)

text_len = len(re.sub(r"<[^>]+>", " ", html))
print("===== RÉSULTAT DU PRÉ-RENDU (page Disneyland) =====")
print(f"Fichier généré : {out_file}")
print(f"Taille HTML      : {len(html):,} octets")
print(f"Texte visible    : ~{text_len:,} caractères (contenu lisible par les robots)")
print(f"#root enfants    : {root_children} (0 = vide/non rendu, >0 = contenu présent)")
print(f"<title>          : {title}")
print(f"meta description : {desc[:160]}")
print(f"canonical        : {canonical}")
print(f"H1               : {h1}")
print(f"JSON-LD (@type)  : {ldjson}")
print(f"hreflang         : {hreflang}")
