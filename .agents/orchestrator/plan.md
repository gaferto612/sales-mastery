# Sales Mastery Course Audit — Execution Plan

## Objective
Audit all 30 HTML course modules in `c:\Users\henri\Desktop\GitHub\sales-mastery`, comparing Modules 1-26 against the "PhD-level" standard established in Modules 27-30. Produce `audit_report.md` containing dedicated evaluation sections for each module, specific structural gaps identified, and concrete upgrade recommendations.

## Execution Phases

### Phase 1: Benchmark Spec Extraction (Modules 27-30)
- **Goal**: Analyze Modules 27, 28, 29, 30 to extract the precise structural criteria and qualitative benchmarks defining the "PhD-level" standard.
- **Worker**: Dispatch Explorer to evaluate Modules 27-30 and create `.agents/orchestrator/phd_benchmark_spec.md`.
- **Output**: Detailed benchmark specification document detailing requirements for academic citations, biological state analysis, clinical case studies, verbatim roleplays, formatting, and depth.

### Phase 2: Parallel Batch Audits (Modules 1-30)
- **Goal**: Analyze all 30 HTML modules against the PhD benchmark specification.
- **Batches**:
  - Batch 1: Modules 01-05
  - Batch 2: Modules 06-10
  - Batch 3: Modules 11-15
  - Batch 4: Modules 16-20
  - Batch 5: Modules 21-25
  - Batch 6: Modules 26-30
- **Workers**: Dispatch `teamwork_preview_explorer` subagents for each batch.
- **Outputs**: Detailed analysis files in subagent workspace folders under `.agents/`.

### Phase 3: Audit Report Compilation
- **Goal**: Synthesize all batch evaluations into the final `audit_report.md` artifact at `c:\Users\henri\Desktop\GitHub\sales-mastery\audit_report.md`.
- **Worker**: Dispatch `teamwork_preview_worker` to write `audit_report.md`.
- **Output Requirements**:
  - Full executive summary & comparative overview.
  - Dedicated evaluation section for all 30 modules (Modules 01 to 30).
  - Explicit identification of missing structural elements in Modules 1-26 compared to Phase 7 benchmark.
  - Actionable, concrete recommendations for upgrading each module to PhD level.

### Phase 4: Review and Forensic Integrity Audit
- **Goal**: Verify completeness, accuracy, and authenticity of `audit_report.md`.
- **Workers**:
  - `teamwork_preview_reviewer`: Verify all 30 modules are thoroughly covered with no skipped sections.
  - `teamwork_preview_auditor`: Conduct forensic audit to ensure genuine, non-fabricated, high-quality analysis.
