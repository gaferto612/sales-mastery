# Curriculum audit remediation

This file records the publication checklist identified during the repository audit.

## Release blockers

- Complete the missing failure-mode section and `failure-mode` anchor in `module-35.html`.
- Replace any exact statistic that is not traceable to a primary source with bounded, conditional language.
- Run `npm run build` followed by `npm run validate` and keep generated assets synchronized.

## Content improvements

- Add explicit “This is different from…” boundaries to modules covering discovery, qualification, negotiation, retention, and account strategy.
- Label cases as real, composite, or illustrative wherever they appear, and describe the collection as “case studies and realistic scenarios.”
- Add an assessed artifact to each level and use the existing rubrics for feedback, not only multiple-choice checks.
- Mark contested lenses as optional and include a “when not to use this” subsection.
- Rotate in cases from multiple industries so the Brayford thread teaches transfer rather than one-domain pattern matching.

## Product improvements

- Add level, role-path, core/advanced, and completion filters to the module index.
- Reduce card density on small screens and group long module navigation into Learn, Apply, and Review.
- Add a CI job that builds, validates, and runs state tests on every change.
- Consolidate temporary batch scripts and agent artifacts outside the production source tree.
