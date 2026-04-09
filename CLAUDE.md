# Meroka — Healthcare Intelligence Platform

Meroka is a market-making platform enabling direct contracting between independent medical practices and self-insured employers — bypassing traditional insurance networks. The core thesis: independent practices deliver equal or better care at significantly lower cost than hospital-affiliated and PE-owned practices, but lack the infrastructure to contract directly with employers. Meroka provides that infrastructure.

The interactive wireframe (`meroka-wireframe-v3.html`) maps the full data pipeline: 30+ public and private data sources → AWS S3 Data Lake → Data Warehouse (70+ fields) → Products.

## Dev Server

```
npx live-server --port=8000 --open=meroka-wireframe-v3.html
```

Hot-reloads on file save. Requires Node.js.

## Diagrams

Mermaid JS is loaded from CDN (`startOnLoad: false`). Page files in `pages/` can include `<div class="mermaid">` blocks — call `mermaid.run()` after injecting HTML to render them. See `pages/tic-rates-structure.js` for an example.

## Team

- **Alex Barrett** — Owner, Direct Contracting Marketplace (DCM)
- **Othmane** — Owner, Malpha
- **Bonnie** — Owner, Rural Health Classifier

## Products

### Direct Contracting Marketplace (DCM) — External
Owner: Alex Barrett

Market-making platform for direct contracting between independent medical practices and self-insured employers. Five-layer pipeline:

- **L1: Provider Map** — Identify every independent practice, classify ownership via NPPES + PECOS + web scraping
- **L2: Services & Revenue** — What each practice does, how much, and what they get paid (Medicare utilization + TiC negotiated rates)
- **L3: Quality Signals** — MIPS scores, CMS Care Compare, Google Business ratings, state medical board license status
- **L4: Comparison Engine** — Prove independents deliver equal or better care at lower cost. Generate headline stats for employer pitch
- **L5: Employer Contracting & Legal Agent** — Auto-generate CIN formation docs, direct employer-provider contracts, TPA coordination memos. Grounded in AKS safe harbors, Stark exceptions, ERISA, FTC CIN guidelines, state-specific compliance

Current phase: **MA Sports Medicine POC** (Feb 2026) — ~200 practices, 6 taxonomy codes, 15 target CPTs. Proves the thesis with real data for one specialty in one state.

Future phases: MA Full Specialty Expansion (Q2 2026), Multi-state Rollout — CT, NY, NJ (Q3 2026).

### Rural Health Classifier — External
Owner: Bonnie

Classify practices by Rural Health Clinic (RHC) eligibility per CMS definition:
1. Located in a non-urbanized area (Census/RUCA)
2. Within a HPSA or MUA (HRSA)
3. CLIA-certified lab for basic diagnostics
4. High Medicare/Medicaid patient share

Workflows: Rural Eligibility Classification → Shortage Area Overlay → CLIA Lab Certification Check → Payer Mix Analysis → RHC Readiness Score

### Malpha — Internal
Owner: Othmane. Coming soon.

---

## Data Sources

### Government / CMS
| Source | ID | Format | Frequency | Records | Cost |
|---|---|---|---|---|---|
| NPPES (NPI Registry) | `nppes` | CSV (~9 GB), JSON API | Monthly | ~8-9M NPIs | Free |
| CMS PECOS (Provider Enrollment) | `pecos` | CSV, API | Quarterly | ~1.5-2M providers | Free |
| DAC (Doctors & Clinicians) | `dac` | CSV (~300 MB) | Monthly | ~2.8M records | Free |
| CMS Provider of Services | `pos` | CSV, JSON API | Quarterly | ~100K providers + 300K labs | Free |
| CMS CLIA Labs | `clia` | CSV (~156 MB), JSON API | Quarterly | ~244K labs | Free |
| Medicare Physician Utilization | `medicare_util` | Tab-delimited CSV, JSON API | Annually (1-2yr lag) | ~10M+ rows/year | Free |
| MIPS / QPP | `mips` | CSV, JSON API | Annually (~18mo lag) | ~700K-900K clinicians | Free |
| CMS Care Compare | `care_compare` | CSV, JSON API | Quarterly | ~5K hospitals, ~1.3M clinicians | Free |

### HRSA / Rural Health
| Source | ID | Format | Frequency | Cost |
|---|---|---|---|---|
| HRSA FQHCs | `hrsa` | XLSX, CSV | Annually | Free |
| HRSA HPSA / MUA Designations | `hpsa_mua` | CSV/XLSX, web tool | Rolling | Free |
| USDA RUCA Codes | `ruca` | XLSX | Decennial (2020 Census) | Free |
| Census Urban Area Boundaries | `census_ua` | Shapefile, TIGER/Line | Decennial | Free |

### Pricing & Cost
| Source | ID | Format | Frequency | Cost |
|---|---|---|---|---|
| Transparency in Coverage (TiC) Files | `tic` | JSON (.gz) — terabyte-scale | Monthly | Free |
| FAIR Health | `fair_health` | Licensed REST API | Semi-annual | **Paid** |
| MEPS (AHRQ) | `meps` | SAS, Stata, XLSX | Annually (~2yr lag) | Free |
| RAND / Sage Hospital Pricing | `rand` | Web dashboard, CSV | Biennial | Free |

### Quality & Reputation
| Source | ID | Format | Cost |
|---|---|---|---|
| Leapfrog Safety Grades | `leapfrog` | Web (free), Excel/API (licensed) | Paid |
| State Medical Boards (FSMB) | `med_boards` | REST API, bulk files | Paid ($9-12/physician) |
| Healthgrades / Vitals | `healthgrades` | No official API — scraping | Restricted |
| Google Business Profiles | `google` | Places API (JSON) | Paid (per-use) |

### Web & Commercial Intelligence
| Source | ID | Format | Cost |
|---|---|---|---|
| Practice Websites (scraping) | `website` | Unstructured HTML | Free |
| LinkedIn | `linkedin` | REST API (partner only) | Restricted |
| SEC EDGAR + State SoS | `sos` | REST API, HTML/CSV | Free |
| DOL Form 5500 | `form5500` | Zipped CSV (multi-table) | Free |
| GAO Market Concentration | `gao` | PDF reports (no structured data) | Free |

### Internal / Derived
| Source | ID | Description |
|---|---|---|
| AI Independence Classifier | `ai_classifier` | Classifies practice ownership: Independent / PE-backed / System-Affiliated / FQHC / Academic |
| Known PE Platforms | `pe_list` | PESP nonprofit tracker + PitchBook. ~488 PE-owned hospitals, 420+ platforms |
| Derived & Calculated Fields | `derived` | Composite scores, deltas, estimates computed from upstream sources |

### Legal & Regulatory
| Source | ID | Description |
|---|---|---|
| Anti-Kickback Statute (AKS) | `aks` | HHS OIG — safe harbors for VBC arrangements |
| Stark Law (Physician Self-Referral) | `stark` | CMS — exceptions for value-based arrangements |
| ERISA | `erisa` | DOL — governs self-insured employer health plans. ERISA preemption = employers bypass state insurance mandates |
| Value-Based Care Safe Harbors (2021) | `vbc_safe_harbors` | The single most important federal development — enables CIN-based direct contracting |
| FTC/DOJ CIN & Antitrust Guidelines | `ftc_cin` | Clinical integration standard for legally defensible CINs |
| State Law (per-state) | `state_law` | State-specific: AG oversight, cost containment, TPA licensing, medical boards, APCDs. Currently mapped: MA (8 sources) |

### Source Integration Status
**Completed:** nppes, pecos, pos, clia, medicare_util, mips, care_compare, hrsa, hpsa_mua, ruca, census_ua, meps, pe_list, derived, aks, stark, erisa, vbc_safe_harbors, ftc_cin, state_law

**Backlog (priority order):**
1. TiC Files — Q2 2025
2. FAIR Health — Q2 2025
3. Practice Websites — Q3 2025
4. Google Business — Q3 2025
5. DOL Form 5500 — Q3 2025
6. AI Independence Classifier — Q4 2025
7. Leapfrog Safety — Q4 2025
8. Healthgrades — Q4 2025
9. LinkedIn — Q1 2026
10. SEC / State SoS — Q1 2026
11. State Medical Boards — Q1 2026
12. GAO Market Conc. — Q2 2026
13. RAND / Sage — Q2 2026

---

## Data Warehouse Schema

All fields live in a single conceptual warehouse. Each field traces back to one or more data sources.

### Identity
| Field | Sources |
|---|---|
| `practice_name` | nppes |
| `npi` | nppes |
| `address` | nppes |
| `phone` | nppes |
| `specialty` | nppes |
| `taxonomy_code` | nppes |
| `website_url` | website |
| `legal_entity_name` | website, sos |

### Roster
| Field | Sources |
|---|---|
| `providers[]` | nppes, pecos |
| `provider_count` | nppes, pecos |
| `credentials` | pecos |
| `reassignment_org` | pecos |

### Independence
| Field | Sources |
|---|---|
| `ownership_type` | ai_classifier |
| `parent_entity` | ai_classifier |
| `independence_confidence` | ai_classifier |
| `pe_platform_match` | pe_list |
| `facility_type_flag` | pos |
| `fqhc_flag` | hrsa |

### Rural & Shortage
| Field | Sources |
|---|---|
| `ruca_code` | ruca |
| `rurality_tier` | ruca, census_ua |
| `hpsa_flag` | hpsa_mua |
| `mua_flag` | hpsa_mua |
| `hpsa_score` | hpsa_mua |
| `clia_status` | clia |
| `clia_cert_type` | clia |
| `dual_eligible_pct` | medicare_util |
| `rhc_eligibility_score` | derived |

### Technology
| Field | Sources |
|---|---|
| `ehr_system` | website |
| `scheduling_platform` | website |
| `telehealth_available` | website |
| `accepted_insurances[]` | website |

### Services
| Field | Sources |
|---|---|
| `cpt_codes[]` | medicare_util, tic |
| `medicare_service_count` | medicare_util |
| `medicare_beneficiary_count` | medicare_util |

### Revenue
| Field | Sources |
|---|---|
| `medicare_volume_by_cpt` | medicare_util |
| `medicare_allowed_amt` | medicare_util |
| `commercial_rates_by_payer` | tic |
| `payer_mix_estimate` | meps |
| `est_annual_revenue` | derived |
| `fair_health_benchmark` | fair_health |

### Quality
| Field | Sources |
|---|---|
| `mips_quality_score` | mips |
| `mips_cost_score` | mips |
| `facility_quality` | care_compare |
| `leapfrog_grade` | leapfrog |
| `hac_penalty_flag` | care_compare |
| `board_certifications[]` | website, med_boards |
| `accreditations[]` | website |
| `composite_quality_tier` | derived |

### Patient Satisfaction
| Field | Sources |
|---|---|
| `google_rating` | google |
| `review_count` | google |
| `review_sentiment` | google, ai_classifier |
| `healthgrades_rating` | healthgrades |

### Market Comparison
| Field | Sources |
|---|---|
| `cost_delta_vs_hospital` | derived |
| `quality_delta` | derived |
| `regional_markup_pct` | rand |
| `opportunity_score` | derived |

### Employer
| Field | Sources |
|---|---|
| `nearby_employers[]` | form5500 |
| `employer_benefit_cost` | form5500 |
| `market_concentration` | gao |
| `decision_makers[]` | linkedin |
| `est_overpayment` | derived |
| `savings_pitch` | derived |

### Legal & Compliance
| Field | Sources |
|---|---|
| `aks_safe_harbor_flags` | aks, vbc_safe_harbors |
| `stark_exception_flags` | stark, vbc_safe_harbors |
| `cin_eligibility` | ftc_cin |
| `erisa_plan_type` | erisa, form5500 |
| `state_compliance_flags` | state_law |
| `tpa_requirements` | state_law, erisa |
| `contract_template_id` | derived |

---

## Architecture (DCM POC)

- **Mac Mini M4** — Always-on local compute. Runs pipelines and agents overnight. ~/meroka/ — scripts/, data/, logs/, outputs/, credentials/
- **Claude Sonnet (Anthropic API)** — Reasoning brain for web scrape classification, insights reports, legal drafting. ~$5-30/wk
- **OpenClaw Agent Framework** — Gives Claude ability to browse, run code, read/write files. Gateway port 18789, Brave relay port 18792
- **Google BigQuery** — meroka-massachusetts.sports_medicine — serverless cloud warehouse. <$1/wk
- **AWS S3 Data Lake** — Raw source files stored as Parquet via Glue ETL. Partitioned by state.
- **Outputs** — Streamlit dashboard (localhost:8501), CFO insights reports, CIN formation docs, employer contracts

Flow: Phone (Telegram) → Mac Mini → Claude API → BigQuery → Outputs

### BigQuery Tables (MA Sports Medicine)
| Table | Status |
|---|---|
| `providers` | Done — MA sports medicine from NPPES |
| `practice_profiles` | WIP — Web-scraped independence classification |
| `medicare_utilization` | Done — Medicare payment data for MA |
| `tic_rates` | WIP — Negotiated rates (UHC, BCBS MA, Aetna) |
| `mips_scores` | WIP — MIPS quality scores |
| `practice_reviews` | WIP — Google ratings & reviews |
| `pecos_enrollment` | WIP — Group affiliations |
| `provider_comparison_v2` | Pending — Master join of all layers |

---

## Legal Framework

The legal model for direct contracting rests on:

1. **2021 VBC Safe Harbors** — Three new AKS safe harbors + three new Stark exceptions specifically designed for value-based arrangements. A CIN qualifies as a "value-based enterprise."
2. **ERISA Preemption** — Self-insured employer plans bypass state insurance mandates, making direct contracting legally viable.
3. **FTC Clinical Integration** — CINs are legally defensible for joint price negotiation IF they have genuine clinical integration (quality programs, utilization monitoring, shared protocols).
4. **State Law** — Each state has unique insurance regulations, TPA licensing, AG oversight. Starting with MA (8 sources mapped), expanding to CT, NY, NJ.

Legal knowledge base architecture: Source documents → S3 (s3://meroka-legal/{state}/) → PDF text extracted and chunked (~500 tokens) → vector embeddings → RAG retrieval for Claude context injection.

---

## State Law: Massachusetts (8 sources mapped)

1. MA AG Healthcare Division — AG jurisdiction over healthcare market consolidation
2. MA Health Policy Commission — State body reviewing consolidation, publishes cost/quality data
3. CHIA (Center for Health Info & Analysis) — All-Payer Claims Database (requires DUA)
4. Chapter 224 Cost Containment — Sets healthcare cost growth benchmark
5. MA Division of Insurance — TPA licensing, network adequacy rules
6. MA Board of Registration in Medicine — Credential verification and disciplinary history
7. MA General Laws Ch. 176D — Unfair insurance practices (TPA conduct)
8. MA General Laws Ch. 175 — Insurance licensing requirements

---

## Key Numbers

- Commercial insurers pay ~254% of Medicare rates (RAND study)
- 47% of physicians are now employed by hospitals (2024)
- ~6.5% of physicians are under PE ownership
- RUCA >= 4 = non-urbanized (RHC eligibility threshold)
- HPSA scores range 1-25 (higher = greater shortage)
- MIPS payment adjustments range -9% to +9%
- TiC files: single insurer can be 2+ TB of JSON
