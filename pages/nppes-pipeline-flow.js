// NPPES pipeline flow data — self-registers into global PIPELINE_FLOWS
PIPELINE_FLOWS.nppes = {
  name: 'NPPES (NPI Registry)',
  source: 'Centers for Medicare & Medicaid Services (CMS)',
  url: 'https://download.cms.gov/nppes/NPI_Files.html',
  refresh: 'Monthly',
  rawSize: '~9 GB CSV',
  rawColumns: '330+',
  layers: [
    {
      type: 'raw', name: 'Raw Ingestion',
      storage: 'S3', script: 'ingest.py',
      path: 's3://meroka-raw/nppes/v202603/2026-03-12/nppes_full.csv',
      desc: 'Original NPPES file downloaded from CMS, stored immutably. Version extracted from filename.',
      sampleData: {
        headers: ['NPI', 'Entity Type Code', 'Provider Organization Name', 'Provider Last Name', 'Provider Practice Address', 'Taxonomy Code_1'],
        rows: [
          ['1234567890', '2', 'ACME MEDICAL GROUP LLC', '""', '123 MAIN ST STE 200', '207Q00000X'],
          ['1538462790', '1', '""', 'SMITH', '456 OAK AVE', '208D00000X'],
          ['0056789012', '2', 'OAK AVENUE CLINIC', '""', '456 OAK AVE FL 2', '261QP2300X']
        ],
        nullCols: [3, 2]
      }
    },
    {
      type: 'etl', name: 'AWS Glue ETL',
      script: 'transform.py',
      steps: [
        'Read manifest \u2192 get latest version path',
        'Read raw CSV from S3',
        'Filter to Entity Type 2 (organizations only)',
        'Normalize NPI \u2014 zero-pad to 10 chars',
        'Transform: rename columns, type-cast, standardize case',
        'Add lineage columns: _source_version_id, _run_id, _ingested_at',
        'Write to Unified Iceberg table (overwrite)',
        'Validate: row count, null rates, schema match'
      ],
      schemaSnippet: 'SCHEMA = {\n  "source": "nppes",\n  "unique_key": ["npi"],\n  "columns": [\n    {"raw": "NPI", "clean": "npi", "type": "str"},\n    {"raw": "Provider Organization Name", "clean": "organization_name", "type": "str"},\n    {"raw": "Provider Practice Address", "clean": "practice_address", "type": "str"},\n    // ~20 columns defined\n  ]\n}'
    },
    {
      type: 'unified', name: 'Unified Table',
      storage: 'S3 + Iceberg', script: 'transform.py',
      path: 's3://meroka-unified/nppes/',
      desc: 'Cleaned, standardized Iceberg table. One table per source, latest version only.',
      sampleData: {
        headers: ['npi', 'entity_type', 'organization_name', 'practice_address', 'taxonomy_code', '_source_version_id', '_run_id'],
        rows: [
          ['1234567890', '2', 'Acme Medical Group LLC', '123 Main St Ste 200', '207Q00000X', 'v202603', 'a1b2c3d4'],
          ['0056789012', '2', 'Oak Avenue Clinic', '456 Oak Ave Fl 2', '261QP2300X', 'v202603', 'a1b2c3d4']
        ],
        lineageCols: [5, 6]
      },
      fieldsProvided: ['npi', 'practice_name', 'address', 'phone', 'specialty', 'taxonomy_code', 'providers', 'provider_count']
    },
    {
      type: 'consolidated', name: 'Consolidated Entity',
      storage: 'Redshift', script: 'build.py',
      desc: 'Cross-source joins into business entities. Hub-and-spoke schema centered on PRACTICE (NPI).',
      joinDesc: 'unified.nppes JOIN unified.pecos ON npi',
      sampleData: {
        headers: ['npi', 'nppes_name', 'pecos_name', 'practice_name', 'practice_address', 'ownership_type', '_run_id'],
        rows: [
          ['1234567890', 'Acme Medical Group LLC', 'Acme Medical Group', 'Acme Medical Group', '123 Main St Ste 200', 'null', 'e5f6g7h8'],
          ['0056789012', 'Oak Avenue Clinic', 'Oak Avenue Clinic', 'Oak Avenue Clinic', '456 Oak Ave Fl 2', 'null', 'e5f6g7h8']
        ],
        goldenCols: [3],
        nullCols: [5],
        lineageCols: [6]
      }
    },
    {
      type: 'aggregate', name: 'Aggregate Views',
      storage: 'Redshift', script: 'materialized views',
      desc: 'Pre-computed metrics optimized for querying. Reads from consolidated tables.',
      consumers: ['Direct SQL queries', 'Slack bot (keyword \u2192 SQL)', 'Streamlit dashboard'],
      sampleData: {
        headers: ['npi', 'practice_name', 'specialty', 'region', 'provider_count', 'taxonomy_codes'],
        rows: [
          ['1234567890', 'Acme Medical Group', 'Family Medicine', 'MA', '12', '207Q00000X'],
          ['0056789012', 'Oak Avenue Clinic', 'Clinic/Center', 'MA', '3', '261QP2300X']
        ]
      }
    }
  ]
};
