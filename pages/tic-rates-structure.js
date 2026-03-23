// TiC In-Network Rates — file structure hierarchy
// Self-registers into global PIPELINE_FLOWS

// ── Mermaid Diagrams ──

const TIC_TABLE_OF_CONTENTS_DIAGRAM = `
graph TD
  NAT["<b>Blue Cross Blue Shield</b>"]
  P["<b>BCBS of Massachusetts</b>"]
  F1["<b>In-Network Rate File</b><br/>blue-choice.json.gz"]
  F2["<b>In-Network Rate File</b><br/>preferred-blue-ppo.json.gz"]
  F3["<b>In-Network Rate File</b><br/>hmo-blue.json.gz"]
  PL1["Blue Choice"]
  PL2["Preferred Blue PPO"]
  PL3["HMO Blue"]
  PL4["Blue Choice Plus"]

  NAT --> P
  P --> F1
  P --> F2
  P --> F3
  F1 -.- PL1
  F1 -.- PL4
  F2 -.- PL2
  F3 -.- PL3

  style NAT fill:#f59e0b44,stroke:#f59e0b,color:#e2e8f0
  style P fill:#f59e0b,stroke:#f59e0b,color:#000
  style F1 fill:#3b82f622,stroke:#3b82f6,color:#e2e8f0
  style F2 fill:#3b82f622,stroke:#3b82f6,color:#e2e8f0
  style F3 fill:#3b82f622,stroke:#3b82f6,color:#e2e8f0
  style PL1 fill:#f59e0b22,stroke:#f59e0b,color:#e2e8f0
  style PL2 fill:#f59e0b22,stroke:#f59e0b,color:#e2e8f0
  style PL3 fill:#f59e0b22,stroke:#f59e0b,color:#e2e8f0
  style PL4 fill:#f59e0b22,stroke:#f59e0b,color:#e2e8f0
`;

const TIC_RATEFILE_DIAGRAM = `
graph TD
  FILE["<b>In-Network Rate File</b><br/>blue-choice.json.gz"]

  PG1["<b>Provider Group 1</b><br/>1 NPI · TIN 04-3891256<br/><i>solo practitioner</i>"]
  PG2["<b>Provider Group 2</b><br/>4 NPIs · TIN 04-7723410<br/><i>sports medicine practice</i>"]
  PGN["<b>...</b><br/><i>thousands more groups</i>"]

  R1["<b>$127.50</b> · CPT 99213<br/>professional · office"]
  R2["<b>$98.00</b> · CPT 29881-TC<br/>professional · outpatient"]
  RN["<b>...</b><br/><i>thousands more rates</i>"]

  FILE --> PG1
  FILE --> PG2
  FILE --> PGN
  PG2 --> R1
  PG2 --> R2
  PG2 --> RN

  style FILE fill:#3b82f622,stroke:#3b82f6,color:#e2e8f0
  style PG1 fill:#8b5cf622,stroke:#8b5cf6,color:#e2e8f0
  style PG2 fill:#8b5cf622,stroke:#8b5cf6,color:#e2e8f0
  style PGN fill:#8b5cf622,stroke:#8b5cf6,color:#94a3b8
  style R1 fill:#10b98122,stroke:#10b981,color:#e2e8f0
  style R2 fill:#10b98122,stroke:#10b981,color:#e2e8f0
  style RN fill:#10b98122,stroke:#10b981,color:#94a3b8
`;

// ── Page Content ──

PIPELINE_FLOWS.tic = {
  name: 'Transparency in Coverage (TiC) — In-Network Rates',
  source: 'Mandated by CMS / HHS / DOL — published by each health insurer',
  url: 'https://github.com/CMSgov/price-transparency-guide',
  rawSize: 'JSON (.gz) — terabyte-scale',
  rawColumns: 'Nested JSON (no fixed columns)',
  refresh: 'Monthly',

  html: `
<style>
  .pf-body { padding: 20px 24px; overflow-y: auto; max-height: calc(90vh - 120px); }
  .pf-section-title { font-size: 14px; font-weight: 600; color: #e2e8f0; margin-bottom: 4px; }
  .pf-desc { font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
  .pf-desc strong { color: #e2e8f0; }
  .pf-card { background: #12141c; border: 1px solid #2d3348; border-radius: 6px; padding: 16px; margin-bottom: 16px; }
  .pf-pre {
    font-family: monospace; font-size: 11px; line-height: 1.6; color: #94a3b8;
    background: #12141c; border: 1px solid #2d3348; border-radius: 6px;
    padding: 12px; overflow-x: auto; margin: 0;
  }
  .pf-table { width: 100%; border-collapse: collapse; font-size: 11px; white-space: nowrap; }
  .pf-table th {
    background: #0f1117; padding: 6px 12px; text-align: left; font-weight: 600;
    color: #94a3b8; border-bottom: 1px solid #2d3348;
  }
  .pf-table th.right { text-align: right; }
  .pf-table td { padding: 5px 12px; border-bottom: 1px solid rgba(45,51,72,0.5); color: #94a3b8; }
  .pf-table td.provider { color: #8b5cf6; font-weight: 600; }
  .pf-table td.provider span { color: #64748b; font-weight: 400; }
  .pf-table td.rate { font-family: monospace; color: #10b981; text-align: right; font-weight: 600; }
  .pf-table-wrap { overflow-x: auto; border: 1px solid #2d3348; border-radius: 6px; }
  .pf-mermaid { background: #12141c; border: 1px solid #2d3348; border-radius: 6px; padding: 16px; text-align: center; }
  .pf-note {
    background: rgba(245,158,11,0.04); border: 1px dashed rgba(245,158,11,0.3);
    border-radius: 10px; padding: 20px 24px; margin: 0 24px;
  }
  .pf-note-title { font-size: 14px; font-weight: 600; color: #f59e0b; }
  .pf-note-badge {
    font-size: 9px; padding: 2px 8px; border-radius: 12px;
    background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); font-weight: 600;
  }
  .pf-step-num {
    width: 24px; height: 24px; border-radius: 50%; font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
  }
  .pf-step-title { font-size: 16px; font-weight: 600; color: #e2e8f0; }
  .pf-highlight { color: #e2e8f0; }
  .pf-diagram-section { margin-bottom: 20px; }
  .pf-step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .pf-step-desc { font-size: 13px; color: #94a3b8; margin: 4px 0 12px 34px; }
  .pf-step-content { margin-left: 34px; }
  .pf-cpt-header { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
  .pf-cpt-code { font-family: monospace; font-size: 13px; font-weight: 700; color: #e2e8f0; }
  .pf-cpt-label { font-size: 11px; color: #94a3b8; }
  .pf-note-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .pf-json-key { color: #8b5cf6; font-weight: 600; }
  .pf-json-val { color: #10b981; font-weight: 600; }
  .pf-layer-purple { border-color: rgba(139,92,246,0.3); border-left: 4px solid #8b5cf6; }
  .pf-layer-green { border-color: rgba(16,185,129,0.3); border-left: 4px solid #10b981; }
</style>
<div class="pf-body">

  <!-- Diagram 1: Table of Contents -->
  <div class="pf-diagram-section">
    <div class="pf-section-title">Table of Contents</div>
    <p class="pf-desc">Every health insurer in the US is required to publish these files monthly. The reporting entity is the state-level legal entity (e.g. "UnitedHealthcare of Massachusetts, Inc."), not the national brand.</p>
    <p class="pf-desc">Across all payors there are <strong>thousands of rate files</strong>. At the upper end, United Healthcare publishes <strong>~22,000 files per month</strong>, each <strong>ranging from 100 MB to 1+ TB uncompressed</strong>. Multiple plans can share one file.</p>
    <div class="mermaid pf-mermaid">
${TIC_TABLE_OF_CONTENTS_DIAGRAM}
    </div>
  </div>

  <!-- Diagram 2: Inside a single In-Network Rate File -->
  <div class="pf-diagram-section">
    <div class="pf-section-title">Inside an In-Network Rate File</div>
    <p class="pf-desc">Each file contains provider groups and their negotiated rates across thousands of billing codes. NOTE: This is a slight simplification, in reality the provider groups are nested within the billing code entries.</p>
    <div class="mermaid pf-mermaid">
${TIC_RATEFILE_DIAGRAM}
    </div>
  </div>

  <div class="pf-section-title" style="margin-bottom:12px;">Detailed Examples</div>

  <!-- Provider Groups -->
  <div class="pipeline-flow-layer pf-layer-purple">
    <div class="pf-step-header">
      <span class="pf-step-num" style="background:#8b5cf6;color:#fff;">1</span>
      <span class="pf-step-title">Provider Groups</span>
    </div>
    <p class="pf-step-desc">Providers are clustered into groups &mdash; typically all the NPIs billing under one TIN (tax ID). Each group gets a numeric ID used throughout the file. A group might be a single solo practitioner or a multi-physician practice.</p>
    <pre class="pf-pre pf-step-content">"provider_references": [
  {
    <span class="pf-json-key">"provider_group_id": 3</span>,
    "provider_groups": [
      {
        "npi": [<span class="pf-highlight">1215134309</span>, <span class="pf-highlight">1043649635</span>, <span class="pf-highlight">1851721047</span>, <span class="pf-highlight">1285715185</span>],
        "tin": { "type": "ein", "value": "<span class="pf-highlight">04-3891256</span>" }
      }
    ]
  },
  {
    <span class="pf-json-key">"provider_group_id": 7</span>,
    "provider_groups": [
      {
        "npi": [<span class="pf-highlight">1467430819</span>],
        "tin": { "type": "ein", "value": "<span class="pf-highlight">04-7723410</span>" }
      }
    ]
  }
  // ... thousands more groups
]</pre>
  </div>

  <div class="pipeline-flow-connector"><div class="pf-connector-line"></div><div class="pf-connector-arrow"></div></div>

  <!-- Negotiated Rates -->
  <div class="pipeline-flow-layer pf-layer-green">
    <div class="pf-step-header">
      <span class="pf-step-num" style="background:#10b981;color:#000;">2</span>
      <span class="pf-step-title">Negotiated Rates</span>
    </div>
    <p class="pf-step-desc">Each billing code has a separate negotiated rate per provider group. The same procedure can be reimbursed at wildly different amounts depending on who performs it.</p>

    <div class="pf-card pf-step-content">
      <div class="pf-cpt-header">
        <span class="pf-cpt-code">CPT 99213</span>
        <span class="pf-cpt-label">&mdash; Office Visit, Established Patient</span>
      </div>
      <div class="pf-table-wrap">
        <table class="pf-table">
          <thead><tr>
            <th>Provider Group</th>
            <th>Type</th>
            <th>Billing Class</th>
            <th>Place of Service</th>
            <th class="right">Rate</th>
          </tr></thead>
          <tbody>
            <tr>
              <td class="provider">Group 2 <span>(sports medicine practice)</span></td>
              <td>negotiated</td>
              <td>professional</td>
              <td>office (11)</td>
              <td class="rate">$127.50</td>
            </tr>
            <tr>
              <td class="provider">Group 1 <span>(solo practitioner)</span></td>
              <td>negotiated</td>
              <td>professional</td>
              <td>office (11)</td>
              <td class="rate">$98.00</td>
            </tr>
            <tr>
              <td class="provider">Group 45 <span>(hospital outpatient dept)</span></td>
              <td>negotiated</td>
              <td>institutional</td>
              <td>outpatient (22)</td>
              <td class="rate">$312.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pf-card pf-step-content">
      <div class="pf-cpt-header">
        <span class="pf-cpt-code">CPT 29881-TC</span>
        <span class="pf-cpt-label">&mdash; Knee Arthroscopy, Technical Component</span>
      </div>
      <div class="pf-table-wrap">
        <table class="pf-table">
          <thead><tr>
            <th>Provider Group</th>
            <th>Type</th>
            <th>Billing Class</th>
            <th>Place of Service</th>
            <th class="right">Rate</th>
          </tr></thead>
          <tbody>
            <tr>
              <td class="provider">Group 2 <span>(sports medicine practice)</span></td>
              <td>negotiated</td>
              <td>professional</td>
              <td>ASC (24)</td>
              <td class="rate">$2,340.00</td>
            </tr>
            <tr>
              <td class="provider">Group 45 <span>(hospital outpatient dept)</span></td>
              <td>negotiated</td>
              <td>institutional</td>
              <td>outpatient (22)</td>
              <td class="rate">$6,890.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="pipeline-flow-connector"><div class="pf-connector-line"></div><div class="pf-connector-arrow"></div></div>

  <!-- How It's Actually Stored -->
  <div class="pf-note">
    <div class="pf-note-header">
      <span class="pf-note-title">How it's actually stored in the JSON</span>
      <span class="pf-note-badge">inverted from above</span>
    </div>
    <p class="pf-desc">The file is actually organized <strong>by billing code</strong>, not by provider group. Each CPT entry lists which provider groups get what rate. This is why the files are so massive &mdash; every billing code &times; every provider group combination is enumerated.</p>
    <pre class="pf-pre">"in_network": [
  {
    "negotiation_arrangement": "ffs",
    "billing_code_type": "CPT",
    "billing_code": "<span class="pf-highlight">99213</span>",
    "name": "Office Visit - Established Patient",
    "negotiated_rates": [
      {
        <span class="pf-json-key">"provider_groups": [3]</span>,
        "negotiated_prices": [
          {
            "negotiated_type": "negotiated",
            <span class="pf-json-val">"negotiated_rate": 127.50</span>,
            "expiration_date": "2026-12-31",
            "billing_class": "professional",
            "billing_code_modifier": [<span class="pf-highlight">"TC"</span>],
            "service_code": ["21"]
          }
        ]
      },
      {
        <span class="pf-json-key">"provider_groups": [7]</span>,
        "negotiated_prices": [
          {
            "negotiated_type": "negotiated",
            <span class="pf-json-val">"negotiated_rate": 98.00</span>,
            "expiration_date": "2026-12-31",
            "billing_class": "professional",
            "service_code": ["21"]
          }
        ]
      }
    ]
  },
  // ... repeated for every billing code
]</pre>
  </div>

</div>
`
};
