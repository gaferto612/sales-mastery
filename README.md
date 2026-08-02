# Sales Mastery

A practical, opinionated curriculum on selling — online, offline, B2B, psychology, copywriting, negotiation, retention, and the ethics of the craft.

**43 modules · 6 competency levels · 5 role-based paths · 20 drills · 4 capstones · 17 case studies · 172 applied assessment questions · 149,000+ words**

---

## Read it online

If you've enabled GitHub Pages on this repo, the course is live at:

`https://<your-username>.github.io/<repo-name>/`

Otherwise, clone the repo and open `index.html` in a browser — everything is static, no build step.

---

## What's inside

| Module | Topic |
|--------|-------|
| 00 | Introduction — what predicts sales performance, and the evidence standard |
| 01 | Foundations — the value ladder, deal anatomy, buyer awareness |
| 02 | Psychology — influence principles graded by replication, decision biases, trust |
| 03 | Online Selling — funnel arithmetic, constraint diagnosis, channel economics |
| 04 | Offline Selling — behavior sequences over cue-reading, openers, floor audits |
| 05 | Outbound Prospecting — jurisdiction, list quality, relevance, honest metrics |
| 06 | B2B & Enterprise — buying centres, methodologies graded, the artifact that travels |
| 07 | Copywriting — message hierarchy, proof attachment, substantiation limits |
| 08 | Negotiation — BATNA, reservation value, anchoring evidence, conditional trading |
| 09 | Objection Handling — concern, condition, deflection, and indecision |
| 10 | Closing — decision readiness, techniques graded, mutual action plans |
| 11 | Customer Retention — GRR vs NRR, cohorts, time-to-first-value |
| 12 | Ethics & Pitfalls — four decision tests, dark patterns, structural pressure |
| 13 | Tools & Resources — buy by decision, classified reading, deliberate practice |
| 14 | AI in Sales — task selection, real human review, data governance |
| 15 | Selling AI Products — workflow positioning, accuracy, abstention, pricing |
| 16 | Founder-Led Sales — narrowing, design partnerships, the custom-work trap |
| 17 | Product-Led Sales — PQL signals validated on precision and recall |
| 18 | Sales Management — role ambiguity, coaching vs. inspection, cadence |
| 19 | Storytelling — structure, evidence attachment, change narrative |
| 20–22, 27–30 | Contested lenses — mimetic desire, behavioral economics, NLP, TA, polyvagal, OODA, evolutionary psychology |
| 23 | MEDDPICC & Mutual Action Plans — the three-state evidence grid |
| 24 | Working with Procurement — mandate, tactics, the trade matrix |
| 25 | The Prescriptive Demo — subtraction, tell–show–tell, proof plans |
| 26 | The Inner Game — process vs. outcome, loss review, sustainable routines |
| 31 | Customer & Market Research — interviews, evidence synthesis, win/loss |
| 32 | Segmentation, ICP & Positioning — alternatives, category, proof |
| 33 | Consultative Discovery & Diagnosis — causal maps, listening, mutual qualification |
| 34 | Value-Based Selling & Business Cases — quantification, ranges, finance review |
| 35 | Account & Territory Strategy — capacity, prioritization, stakeholder maps |
| 36 | Buying Groups & Decision Enablement — consensus, criteria, sensemaking |
| 37 | Commercial Acumen, Pricing & Packaging — economics, metrics, discount governance |
| 38 | Proposals, RFPs, Security & Contracting — due diligence and paper process |
| 39 | Revenue Operations, Pipeline & Forecasting — stages, flow, calibration |
| 40 | Partnerships, Channels & Ecosystems — models, economics, rules, enablement |
| 41 | Sales Enablement, Hiring & Compensation — work samples, coaching, incentives |
| 42 | Global, Regulated & Public-Sector Selling — localization, procurement, compliance |

Plus:

- **Learning paths** — Core Seller, B2C & Retail, B2B & Enterprise, Founder & SaaS, and Sales Leader
- **Applied knowledge checks** — four scenario-based assessment questions in every module, plus a progressive-disclosure retrieval check inside each lesson
- **Private study tools** — device-local notes, bookmarks, and progress
- **Exercises** — 20 drills tied to the modules
- **Capstones** — four role-based projects with a shared scoring rubric
- **Case Studies** — 17 real-world scenarios broken down

---

## How the content is built

Every module follows the same ten-section structure: a practical introduction, observable
learning objectives, three substantive sections carrying the material, a worked example, a
weak-versus-improved execution comparison, a scored practice brief with a completed
exemplar, an applied knowledge check, and a single immediate action.

Claims are labelled by evidence class:

| Class | Meaning |
|-------|---------|
| **R** | Peer-reviewed research, meta-analysis, or systematic review |
| **L** | Law, regulator guidance, or official standard |
| **V** | Vendor or practitioner dataset, not peer reviewed |
| **F** | Practitioner framework — a structure for thinking, not a law |
| **X** | A claim that failed replication or never had support |

Three files carry the standard:

- [`RESEARCH.md`](RESEARCH.md) — the evidence policy and the core bibliography
- [`EVIDENCE.md`](EVIDENCE.md) — the quantified findings the modules rely on, each with its
  source, its effect size, and the boundary condition that stops it being misused
- [`SALES_CANON.md`](SALES_CANON.md) — the reading list, classified by proper use

Level 6 is deliberately labelled **contested lenses**. Frameworks whose mechanisms are
disputed or refuted — NLP, polyvagal theory, mimetic desire, popular evolutionary
psychology — are taught critically rather than omitted, because learners will meet them
elsewhere presented as fact.

---

## Validation

```bash
npm run build     # generate dist/
npm run validate  # structural checks + learning-state tests
```

`tools/validate-course.mjs` enforces module count, level placement, research notes,
navigation links, homepage counts, a depth floor of 1,800 words per module, the presence of
a practice section and an applied knowledge check in every module, and 3–5 well-formed
assessment questions per module. `tools/test-learning-state.mjs` covers the local
progress-state migration, including that reopening a completed module never regresses it.

---

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under "Source", select **Deploy from a branch**
4. Pick `main` branch, `/ (root)` folder
5. Save. Wait ~1 minute. Your site is live.

---

## Local development

No tooling required. To preview locally:

```bash
# Option 1: just open it
open index.html

# Option 2: serve with Python (better for testing relative links)
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Design notes

- Dark editorial aesthetic (navy + cream + orange accent)
- Typography: Fraunces (display), Inter (body), JetBrains Mono (labels) — all from Google Fonts
- Chart.js loaded from CDN for the interactive charts
- No build step, no framework, no dependencies bundled

---

## License

MIT — use, remix, teach from it. Attribution appreciated but not required.

---

## Contributing

This is meant to be a living curriculum. Suggested improvements, additional case studies, and corrections are welcome via pull request.
