# Handoff Report — Batch 6: Capstones & Evidence Audit (`content: strengthen capstones and evidence`)

## 1. Observation

### A. Capstone Structure & Non-Accreditation Disclaimers (`learning.js`)
- `learning.js` lines 381–424 contained legacy capstone definitions with only 5 fields per capstone (`objective`, `scenario`, `inputs`, `rubric`, `variations`), lacking 10 of the required 15 pedagogical elements.
- Replaced `exerciseCapstones()` in `learning.js` with structured metadata for all 4 capstones (`b2c`, `enterprise`, `founder`, `leader`), rendering all 15 required elements:
  1. Learner role
  2. Scenario
  3. Customer context
  4. Available evidence
  5. Missing information
  6. Constraints
  7. Required assumptions
  8. Deliverables
  9. Evaluation rubric
  10. Beginner version
  11. Advanced version
  12. Partial strong submission excerpt
  13. Self-assessment questions
  14. Related modules
  15. Risk analysis
- Embedded Non-Accreditation Disclosure callout (`<div class="callout non-accreditation-disclaimer">...</div>`) and status badges (`"Practice portfolio item"`, `"Capstone completed (Self-assessed)"`, `"Artifact self-assessed"`) directly in `exerciseCapstones()`.

### B. Repo-Wide Evidence Audit & Claim Remediation
Remediated 17 un-cited, absolute, or overstated claims across 14 module/case-study files:
1. `module-32.html:20`: Replaced `Research shows two distinct groups.` with `In practice, buyers naturally cluster into two distinct groups.`
2. `case-studies.html:733`: Replaced `Always convert it to owned audience.` with `Work to convert rented attention into owned communication channels.`
3. `case-studies.html:925`: Replaced `which guaranteed priority support and a voice in the roadmap.` with `which provided priority support commitments and direct input into the roadmap.`
4. `module-05.html:98`: Replaced `They almost always say "Go ahead."` with `They frequently agree to hear the pitch when framed transparently.`
5. `module-07.html:432`: Replaced `"Doubled conversion in one week"` with `"Improved conversion in one week"`.
6. `module-09.html:286`: Replaced `Always isolate the objection first.` with `Isolate the objection before offering solutions.`
7. `module-10.html:356`: Replaced `Always present a firm recommendation.` with `Present a clear primary recommendation to reduce cognitive burden.`
8. `module-12.html:197`: Replaced `Cost: when discovered (and someone always discovers), reputational damage is permanent.` with `Cost: when discovered, reputational damage can be severe and long-lasting.`
9. `module-12.html:221`: Replaced `Cost: this is the line between a salesperson and a predator. Sometimes legally — always morally.` with `Cost: this breaches professional ethics and in many jurisdictions constitutes fraud.`
10. `module-15.html:76`: Replaced `When writing copy for your AI product, never lead with the technology.` with `When writing copy for your AI product, avoid leading with the underlying technology; position the product around user transformation.`
11. `module-16.html:51`: Replaced `This always fails.` with `This approach frequently fails to build trust or alignment.`
12. `module-17.html:102`: Replaced `Because you have data, you must never send a generic "Just checking in" email.` with `Because you have data, avoid sending generic "Just checking in" emails; anchor follow-ups to specific account events or insights.`
13. `module-19.html:74`: Replaced `Always tie the abstract number to a concrete human emotion or daily reality.` with `Tie abstract metrics to concrete operational realities and stakeholder priorities.`
14. `module-21.html:54`: Replaced `Always drop your highest number first...` with `Consider establishing an initial anchor value (such as total cost of the problem, competitor baseline, or premium package) when appropriate to set a reference point.`
15. `module-21.html:70`: Replaced `Never present more than 3 options.` with `Limit options to 3 or fewer where possible to reduce decision friction.`
16. `module-24.html:122`: Replaced `Never give something without getting something.` with `Trade concessions rather than granting them unilaterally.`
17. `module-37.html:185`: Replaced `Always analyze the impact of deal terms on gross margin, payback period, and cash flow.` with `Analyze the impact of deal terms on gross margin, payback period, and cash flow.`

### C. Build & Validation Status
- Ran `node tools/build-sites.mjs`, building 53 static assets and synchronizing root changes to `dist/static/`.
- Ran `node tools/validate-course.mjs`:
  ```json
  {
    "modules": 43,
    "levels": 6,
    "paths": 5,
    "drills": 20,
    "capstones": 4,
    "cases": 17,
    "researchNotes": 43,
    "moduleWords": 62447,
    "status": "pass"
  }
  ```
- Updated `CONTENT_DEVELOPMENT_LOG.md` with a detailed entry for `content: strengthen capstones and evidence`.

---

## 2. Logic Chain

1. **Capstone Completeness**:
   - The mission required expanding capstone briefs in `learning.js` to contain 15 distinct structural elements for all 4 capstones (`b2c`, `enterprise`, `founder`, `leader`).
   - Updating `capstoneDetails` and `exerciseCapstones()` in `learning.js` guarantees that navigating to `exercises.html#capstones` renders all 15 sections with clear non-accreditation callouts and status tags.

2. **Evidence Audit Integrity**:
   - Course standards demand removing un-cited claims ("Research shows") and absolute assertions ("always", "never", "guaranteed").
   - Systematic replacement across the 14 identified HTML files aligns the entire curriculum with evidence-led commercial selling principles.

3. **Build & Distribution Parity**:
   - Running `node tools/build-sites.mjs` ensures that production static assets in `dist/static/` match the updated root source files.

4. **Validation & Logging**:
   - Running `node tools/validate-course.mjs` confirms all structural and relational constraints remain satisfied (`status: pass`). Adding an entry to `CONTENT_DEVELOPMENT_LOG.md` preserves project development telemetry.

---

## 3. Caveats

- **Scope Boundary**:
  - Batch 6 addresses capstone 15-element upgrades, non-accreditation labeling, global evidence claim remediation, course validation, and logging.
  - Broad claim count alignment between `README.md`, `index.html` hero stats, and historical development log headers is reserved for Batch 7 (`docs: align course claims counts and terminology`).
- No caveats regarding code functionality or validation status.

---

## 4. Conclusion

Batch 6 implementation is fully completed. All 4 capstones render 15 structured elements with non-accreditation disclaimers, all target absolute/un-cited evidence claims are remediated, course validation passes cleanly (`status: pass`), distribution static assets are synchronized, and the development log is updated.

---

## 5. Verification Method

1. **Course Validation**:
   Run `node tools/validate-course.mjs` in the repository root. Confirm JSON output returns `"status": "pass"` with 4 capstones.

2. **Capstone Structure Verification**:
   Inspect `learning.js` function `exerciseCapstones()`. Confirm all 15 elements (Learner role, Scenario, Customer context, Available evidence, Missing information, Constraints, Required assumptions, Deliverables, Evaluation rubric, Beginner version, Advanced version, Partial strong submission excerpt, Self-assessment questions, Related modules, Risk analysis) and non-accreditation disclosure elements are rendered.

3. **Repo-Wide Claim Remediation Verification**:
   Execute `grep_search` across non-.agents files for:
   - `Research shows two distinct groups` -> 0 results
   - `Always convert it to owned` -> 0 results
   - `which guaranteed priority support` -> 0 results
   - `They almost always say` -> 0 results
   - `Doubled conversion in one week` -> 0 results
   - `Always isolate the objection first` -> 0 results
   - `Always present a firm recommendation` -> 0 results
   - `never lead with the technology` -> 0 results
   - `This always fails.` -> 0 results
