"""
Build System Design Dashboard from organized source files.
Run: python build_dashboard.py
Sources: dashboard-src/styles.css, layout.html, app.js
         phase-*/  (markdown content)
Output: dashboard.html, index.html (self-contained)
        solutions/*.html (SEO landing pages)
        sitemap.xml, robots.txt
"""
import os, json

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, 'dashboard-src')

def read(path):
    full = os.path.join(BASE, path) if not os.path.isabs(path) else path
    if os.path.exists(full):
        with open(full, 'r', encoding='utf-8') as f:
            return f.read()
    return ""

# ===== 1. Collect study content =====
STUDY = []

def add(sid, title, phase, path):
    content = read(path)
    if content.strip():
        STUDY.append({"id": sid, "title": title, "phase": phase, "content": content})

# Guides
add("how-to-think", "How to Think -- System Design Framework", "guide", "how-to-think.md")
add("estimation-ref", "Estimation Quick Reference", "guide", "estimation-reference.md")
add("daily-schedule", "Daily Schedule -- Day-by-Day Plan", "guide", "daily-schedule.md")
add("setup", "Setup -- Tools & Environment", "guide", "setup.md")

# Phase 0
add("p0-overview", "Phase 0: Framework & Estimation", "p0", "phase-0-framework/README.md")
add("p0-approach", "How to Approach (RESHADED)", "p0", "phase-0-framework/how-to-approach.md")
add("p0-estimation", "Estimation Cheatsheet", "p0", "phase-0-framework/estimation-cheatsheet.md")
add("p0-requirements", "Requirements Gathering", "p0", "phase-0-framework/requirements-gathering.md")

# Phase 1: Building Blocks
P1_MODULES = [
    ("01-dns-networking", "1.1 DNS & Networking"),
    ("02-load-balancing", "1.2 Load Balancing"),
    ("03-caching", "1.3 Caching"),
    ("04-databases-sql", "1.4 Databases -- SQL"),
    ("05-databases-nosql", "1.5 Databases -- NoSQL"),
    ("06-message-queues", "1.6 Message Queues"),
    ("07-blob-storage-cdn", "1.7 Blob Storage & CDN"),
    ("08-api-design", "1.8 API Design"),
    ("09-proxies-gateways", "1.9 Proxies & Gateways"),
]
for folder, title in P1_MODULES:
    add(f"p1-{folder}", title, "p1", f"phase-1-building-blocks/{folder}/README.md")

# Phase 2: Distributed Concepts
P2_MODULES = [
    ("01-scalability", "2.1 Scalability"),
    ("02-partitioning-sharding", "2.2 Partitioning & Sharding"),
    ("03-replication", "2.3 Replication"),
    ("04-consistency-models", "2.4 Consistency Models"),
    ("05-rate-limiting", "2.5 Rate Limiting"),
    ("06-unique-id-generation", "2.6 Unique ID Generation"),
    ("07-distributed-consensus", "2.7 Distributed Consensus"),
]
for folder, title in P2_MODULES:
    add(f"p2-{folder}", title, "p2", f"phase-2-distributed-concepts/{folder}/README.md")

# Phase 3: Design Patterns
P3_MODULES = [
    ("01-fan-out", "3.1 Fan-out Pattern"),
    ("02-event-sourcing-cqrs", "3.2 Event Sourcing & CQRS"),
    ("03-pub-sub", "3.3 Pub/Sub Pattern"),
    ("04-circuit-breaker-retry", "3.4 Circuit Breaker & Retry"),
    ("05-saga-pattern", "3.5 Saga Pattern"),
    ("06-sharding-strategies", "3.6 Sharding Strategies"),
    ("07-cache-patterns", "3.7 Cache Patterns Deep Dive"),
    ("08-answer-template", "3.8 System Design Answer Template"),
]
for folder, title in P3_MODULES:
    add(f"p3-{folder}", title, "p3", f"phase-3-design-patterns/{folder}/README.md")

# Phase 4 & 5: Design Case Studies
P4_DESIGNS = [
    ("01-url-shortener", "URL Shortener (TinyURL)", "Easy", "Hashing, DB, Cache", "All"),
    ("02-pastebin", "Pastebin", "Easy", "Blob Storage, TTL", "Google, Meta"),
    ("03-rate-limiter", "Rate Limiter", "Easy-Med", "Redis, Sliding Window", "Stripe, Cloudflare"),
    ("04-key-value-store", "Key-Value Store", "Medium", "Partitioning, Replication", "Amazon, Google"),
    ("05-unique-id-generator", "Unique ID Generator", "Easy-Med", "Snowflake, Clock Sync", "Twitter, Meta"),
    ("06-web-crawler", "Web Crawler", "Medium", "BFS, Dedup, Queue", "Google, Microsoft"),
    ("07-notification-system", "Notification System", "Medium", "Pub/Sub, Priority", "Apple, Google"),
    ("08-chat-system", "Chat System (WhatsApp)", "Medium", "WebSocket, Presence", "Meta, Slack"),
    ("09-news-feed", "News Feed (Facebook)", "Medium", "Fan-out, Ranking", "Meta, Twitter"),
    ("10-typeahead", "Typeahead / Autocomplete", "Medium", "Trie, Caching", "Google, Amazon"),
]

P5_DESIGNS = [
    ("01-instagram", "Instagram / Photo Sharing", "Medium", "CDN, Image Pipeline", "Meta, Pinterest"),
    ("02-youtube", "YouTube / Video Streaming", "Hard", "Transcoding, ABR, CDN", "Google, Netflix"),
    ("03-twitter", "Twitter / Social Network", "Hard", "Fan-out, Search, Trending", "Twitter, Meta"),
    ("04-uber", "Uber / Ride Sharing", "Hard", "Geospatial, Matching", "Uber, Lyft"),
    ("05-dropbox", "Dropbox / File Storage", "Hard", "Chunking, Sync, Dedup", "Dropbox, Google"),
    ("06-google-search", "Google Search", "Hard", "Crawling, Indexing, PageRank", "Google, Microsoft"),
    ("07-distributed-cache", "Distributed Cache (Redis)", "Hard", "Partitioning, Eviction", "Amazon, Google"),
    ("08-payment-system", "Payment System (Stripe)", "Hard", "Idempotency, Ledger", "Stripe, PayPal"),
    ("09-ticket-booking", "Ticket Booking System", "Hard", "Seat Locking, Consistency", "BookMyShow, Airbnb"),
    ("10-google-maps", "Google Maps", "Hard", "Geospatial, Routing, Tiles", "Google, Uber"),
]

# Add design READMEs, problems, solutions to study sections
design_num = 1
DESIGN_DATA = []  # for JS

for folder, name, diff, concepts, companies in P4_DESIGNS:
    did = f"p4-{folder}"
    add(did, f"4.{design_num}: {name}", "p4", f"phase-4-classic-starter/{folder}/README.md")
    add(f"{did}-problem", f"Problem: {name}", "p4", f"phase-4-classic-starter/{folder}/problem.md")
    add(f"{did}-solution", f"Solution: {name}", "p4", f"phase-4-classic-starter/{folder}/solution.md")
    DESIGN_DATA.append({
        "id": did, "num": f"4.{design_num}", "name": name, "diff": diff,
        "concepts": concepts, "companies": companies, "phase": "p4"
    })
    design_num += 1

design_num = 1
for folder, name, diff, concepts, companies in P5_DESIGNS:
    did = f"p5-{folder}"
    add(did, f"5.{design_num}: {name}", "p5", f"phase-5-classic-advanced/{folder}/README.md")
    add(f"{did}-problem", f"Problem: {name}", "p5", f"phase-5-classic-advanced/{folder}/problem.md")
    add(f"{did}-solution", f"Solution: {name}", "p5", f"phase-5-classic-advanced/{folder}/solution.md")
    DESIGN_DATA.append({
        "id": did, "num": f"5.{design_num}", "name": name, "diff": diff,
        "concepts": concepts, "companies": companies, "phase": "p5"
    })
    design_num += 1

# Phase 6
add("p6-mock", "Phase 6: Mock Interviews & Review", "p6", "phase-6-mock-interviews/README.md")

# Answer Template
add("tmpl-answer", "Answer Template: 45-Minute Framework", "templates", "templates/answer-template.md")

print(f"Study sections collected: {len(STUDY)}")

# ===== 2. Read source files =====
css = read(os.path.join(SRC, 'styles.css'))
layout = read(os.path.join(SRC, 'layout.html'))
app_js = read(os.path.join(SRC, 'app.js'))

# ===== 3. Build design + phase data JS =====
phases_js = """
const PHASES=[
{id:"p0",name:"Phase 0: Framework",days:"1-3",color:"#8b949e"},
{id:"p1",name:"Phase 1: Building Blocks",days:"4-15",color:"#58a6ff"},
{id:"p2",name:"Phase 2: Distributed",days:"16-24",color:"#bc8cff"},
{id:"p3",name:"Phase 3: Patterns",days:"25-32",color:"#f0883e"},
{id:"p4",name:"Phase 4: Starter Designs",days:"33-44",color:"#3fb950"},
{id:"p5",name:"Phase 5: Advanced Designs",days:"45-54",color:"#d29922"},
{id:"p6",name:"Phase 6: Mock Interviews",days:"55-60",color:"#f85149"}
];
"""

designs_js = "const DESIGNS=" + json.dumps(DESIGN_DATA, ensure_ascii=False) + ";\n"

# ===== 4. Assemble HTML =====
study_js = json.dumps(STUDY, ensure_ascii=False)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="System Design Zero to Hero: Free 60-day system design interview prep with 20 classic designs, interactive dashboard, Mermaid architecture diagrams, estimation calculator, and spaced repetition. URL Shortener, YouTube, Uber, Google Search, and more.">
<meta name="keywords" content="system design, system design interview, FAANG, URL shortener, design YouTube, design Uber, design Twitter, distributed systems, load balancing, caching, sharding, CAP theorem, microservices, scalability, architecture">
<meta name="author" content="Vinay Bhadauria">
<meta property="og:title" content="System Design Zero to Hero -- 60-Day Interview Prep">
<meta property="og:description" content="Free interactive system design course with 20 classic designs, architecture diagrams, and estimation practice.">
<meta property="og:type" content="website">
<meta property="og:url" content="https://vinay199129.github.io/system-design-zth/">
<meta name="twitter:card" content="summary">
<meta name="robots" content="index, follow">
<title>System Design Zero to Hero -- Dashboard</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23161b22'/><text x='50' y='38' font-size='26' text-anchor='middle' fill='%2358a6ff' font-family='monospace' font-weight='bold'>SYS</text><text x='50' y='72' font-size='16' text-anchor='middle' fill='%233fb950' font-family='sans-serif'>Design</text></svg>">
<style>
{css}
</style>
</head>
<body>
{layout}
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
<script>
mermaid.initialize({{ startOnLoad: false, theme: 'dark', themeVariables: {{ primaryColor: '#161b22', primaryTextColor: '#f0f6fc', primaryBorderColor: '#30363d', lineColor: '#58a6ff', secondaryColor: '#21262d', tertiaryColor: '#0d1117' }} }});

// --- Application Logic ---
{app_js}

// --- Phase Data ---
{phases_js}

// --- Design Data ---
{designs_js}

// --- Study Content ---
Study.sections = {study_js};

// --- Initialize ---
State.load();
initDashboard();

// Render Mermaid after initial load
setTimeout(() => {{
  mermaid.run({{ querySelector: '.mermaid' }}).catch(() => {{}});
}}, 100);
</script>
</body>
</html>"""

output = os.path.join(BASE, "dashboard.html")
with open(output, 'w', encoding='utf-8') as f:
    f.write(html)

index = os.path.join(BASE, "index.html")
with open(index, 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Dashboard built: {output}")
print(f"GitHub Pages:    {index}")
print(f"Size: {os.path.getsize(output) // 1024} KB")

# ===== 5. Generate SEO pages for each design =====
seo_dir = os.path.join(BASE, "solutions")
os.makedirs(seo_dir, exist_ok=True)

sitemap_urls = ['https://vinay199129.github.io/system-design-zth/']
seo_count = 0

for d in DESIGN_DATA:
    # Find solution content
    sol_section = next((s for s in STUDY if s["id"] == d["id"] + "-solution"), None)
    if not sol_section or not sol_section["content"].strip():
        continue

    slug = d["id"].replace("p4-", "").replace("p5-", "")

    def esc(s):
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")

    name = d["name"]
    content_escaped = esc(sol_section["content"])

    seo_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(name)} -- System Design Solution | System Design Zero to Hero</title>
<meta name="description" content="{esc(name)} system design solution with architecture diagrams, API design, data model, estimation, and trade-off analysis. Part of System Design Zero to Hero course.">
<meta name="keywords" content="{esc(name)}, system design, architecture, distributed systems, interview prep, {esc(d['concepts'])}">
<meta property="og:title" content="{esc(name)} -- System Design Solution">
<meta property="og:description" content="Complete system design solution with architecture diagrams and trade-off analysis.">
<meta property="og:type" content="article">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://vinay199129.github.io/system-design-zth/solutions/{slug}.html">
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #0d1117; color: #f0f6fc; line-height: 1.7; }}
h1 {{ color: #58a6ff; font-size: 24px; }}
h2 {{ color: #58a6ff; font-size: 18px; margin-top: 24px; }}
a {{ color: #58a6ff; }}
pre {{ background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; overflow-x: auto; font-size: 13px; line-height: 1.5; }}
code {{ font-family: 'Courier New', monospace; }}
.back {{ display: inline-block; margin-bottom: 16px; padding: 6px 14px; background: #21262d; border: 1px solid #30363d; border-radius: 6px; color: #f0f6fc; text-decoration: none; font-size: 13px; }}
.back:hover {{ background: #30363d; }}
.badge {{ display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px; }}
footer {{ margin-top: 40px; padding-top: 16px; border-top: 1px solid #30363d; font-size: 12px; color: #9198a1; text-align: center; }}
</style>
</head>
<body>
<a class="back" href="../index.html">&larr; Back to Dashboard</a>
<h1>{esc(name)}<span class="badge" style="background:rgba(88,166,255,.15);color:#58a6ff;">{esc(d['diff'])}</span></h1>
<p style="color:#9198a1;font-size:13px;">Concepts: {esc(d['concepts'])} &middot; Companies: {esc(d['companies'])}</p>
<h2>Solution</h2>
<pre><code>{content_escaped}</code></pre>
<footer>
<p><strong>System Design Zero to Hero</strong> &copy; 2026 <a href="https://github.com/vinay199129">Vinay Bhadauria</a></p>
<p><a href="https://vinay199129.github.io/system-design-zth/">Full Course Dashboard</a> &middot; <a href="https://github.com/vinay199129/system-design-zth">GitHub</a></p>
</footer>
</body>
</html>"""

    page_path = os.path.join(seo_dir, f"{slug}.html")
    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(seo_html)
    sitemap_urls.append(f'https://vinay199129.github.io/system-design-zth/solutions/{slug}.html')
    seo_count += 1

print(f"SEO pages generated: {seo_count}")

# ===== 6. Generate sitemap.xml =====
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
for url in sitemap_urls:
    sitemap += f'  <url><loc>{url}</loc></url>\n'
sitemap += '</urlset>\n'

with open(os.path.join(BASE, 'sitemap.xml'), 'w', encoding='utf-8') as f:
    f.write(sitemap)

# ===== 7. Generate robots.txt =====
robots = """User-agent: *
Allow: /
Sitemap: https://vinay199129.github.io/system-design-zth/sitemap.xml
"""
with open(os.path.join(BASE, 'robots.txt'), 'w', encoding='utf-8') as f:
    f.write(robots)

print(f"Sitemap: {len(sitemap_urls)} URLs")
print("robots.txt generated")
print("Build complete!")
