# Content Development Log

## Batch 1 — Customer evidence to diagnosis (Modules 31–33)

### Files reviewed

- All 43 module pages, with structural depth metrics
- `course-data.js`, `research-data.js`, `learning.js`, and `script.js`
- `exercises.html`, `case-studies.html`, `audit_report.md`, `RESEARCH.md`, and `SALES_CANON.md`
- Course generation and validation tools

### Files changed

- `module-31.html`
- `module-32.html`
- `module-33.html`
- `exercises.html`
- `case-studies.html`
- `tools/generate-expansion.mjs`

### Main improvements

- Added operational field guides, context-dependent decision rules, limitations, and common failure modes.
- Added realistic composite scenarios and weak-versus-improved conversation examples.
- Added production exercises with objectives, scenarios, required outputs, weighted rubrics, advanced variations, and partial exemplars.
- Added applied knowledge checks and immediate field actions.
- Distinguished research findings from practitioner frameworks, including Jobs-to-be-Done, April Dunford’s positioning sequence, and SPIN.
- Connected customer research, segmentation/positioning, and discovery as one evidence chain.
- Rebuilt the discovery call-review and win/loss interview drills around observable outputs and scoring criteria.
- Reworked the premature-closing case to remove mind-reading and guaranteed-success logic, label it as composite, and add discussion questions.

### Sources verified

- Itani, Goad, and Jaramillo: salesperson-listening meta-analysis.
- Franke and Park: adaptive selling and customer orientation meta-analysis.
- Kirca, Jayachandran, and Bearden: market-orientation meta-analysis.
- Christensen Institute: Jobs-to-be-Done theory.
- April Dunford: positioning components and competitive alternatives.
- Routledge: Neil Rackham’s SPIN Selling practitioner research program.

### Unsupported or overstated claims corrected

- Avoided treating interview compliments or stated intention as demand.
- Avoided presenting SPIN, Jobs-to-be-Done, or positioning sequences as universal scientific laws.
- Avoided universal talk-time ratios, conversion promises, and deterministic ICP scores.

### Remaining gaps

- Modules 34–42 remain substantially too brief for their complexity.
- Modules 14–22 and 25–30 require a second depth and evidence pass.
- Exercises and case studies need consistent scenario labels, stronger rubrics, alternative outcomes, and module references.
- The current Arabic experience uses machine translation and requires professional localization review.
- The central checkpoint system should eventually support multi-question scenario sets and feedback for every option.

### Technical notes

- The existing learning layer injects objectives, research notes, source links, study notes, and mastery checkpoints.
- The scaffold generator now preserves completed depth editions of Modules 31–33.

## Program Batch 1 — Curriculum consistency and learner-state integrity

### Files reviewed

- Authoritative curriculum structures in `course-data.js` and every generated module target
- Homepage counts, card inventory, level placement, and role-path controls
- Exercise and case-study module references and navigation targets
- Legacy and current browser-storage keys for progress, checks, notes, bookmarks, path, and language
- Static-site validation, local link integrity, and responsive card rules

### Main improvements

- Established `course-data.js` as the single authoritative source for 43 modules, 6 levels, 5 role paths, 20 drills, 4 capstones, and 17 cases.
- Rebuilt the static homepage curriculum from that source so all 43 modules appear in the correct six-level sequence without JavaScript-dependent card generation.
- Replaced the conflicting completion systems with one versioned six-state learning record: Not started, In progress, Read, Knowledge check passed, Practice completed, and Skill demonstrated.
- Stopped page-opening from marking a module complete. A module open now records only `started` and `lastOpenedAt`.
- Migrated legacy opens conservatively to In progress, preserved stronger prior evidence separately, and left notes, bookmarks, language, and path preferences untouched.
- Reframed practice and skill demonstration as self-assessed evidence rather than mastery or certification.
- Corrected stale exercise references, the Module 13/14 AI navigation error, and 30 case-study reference or evidence-language problems.
- Made related-module references in exercises and cases clickable.
- Replaced contradictory public counts, including the stale 16-case claim.
- Added repeatable curriculum generation, link/reference transforms, authoritative validation, and state-migration regression tests.

### Unsupported or overstated claims corrected

- Replaced universal claims about retention, churn prevention, storytelling, negotiation firmness, free-user validation, executive pitching, pricing, LTV, and product-led consolidation with bounded decision guidance.
- Removed language that implied a single checkpoint or page view demonstrated mastery.
- Distinguished self-assessment from reviewed performance evidence.

### Verification

- 43 module files and research notes; all modules placed exactly once across 6 levels.
- 5 role paths, 20 numbered drills, 4 capstones, and 17 unique cases.
- Homepage contains exactly 43 linked module cards and accurate public counts.
- Every local HTML target referenced by the site exists.
- Legacy migration, module-opening behavior, and preservation of user notes/bookmarks/path pass automated regression tests.

### Remaining gaps for the next batches

- Modules 34–38 need full production-grade expansion and multi-question assessment sets.
- Modules 39–42 need the same depth pass for revenue systems, channels, enablement, and global/public-sector selling.
- The 20 drills, 4 capstones, and 17 cases need a common scenario/rubric/debrief architecture.
- All 43 modules need a final cross-course evidence, duplication, tone, terminology, and professional Arabic review.
