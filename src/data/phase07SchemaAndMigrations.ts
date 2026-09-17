import { TableSpecification, DatabaseMigration, IndexDefinition } from '../types';

export const ALL_TABLE_SPECIFICATIONS: TableSpecification[] = [
  // ==========================================
  // LAYER A: SOURCE / OBSERVATION (4 TABLES)
  // ==========================================
  {
    name: 'source_system',
    layer: 'A_OBSERVATION',
    mutability: 'REFERENCE_CONFIG',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'VARCHAR',
    description: 'Registry of external data source platforms (e.g. meta_ad_library, google_ad_transparency).',
    provenanceRule: 'Immutable platform registration; defines adapter protocols.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Source system slug (e.g. meta_ad_library)' },
      { name: 'name', type: 'VARCHAR(128)', nullable: false, description: 'Human-readable platform name' },
      { name: 'adapter_version', type: 'VARCHAR(32)', nullable: false, description: 'Current production adapter software version' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'true', description: 'Platform enabled flag' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Registration timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },
  {
    name: 'source_observation',
    layer: 'A_OBSERVATION',
    mutability: 'IMMUTABLE',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Immutable record of an individual public ad observation extracted from Meta Ad Library.',
    provenanceRule: 'Never updated. Anchors all downstream entities and extractions.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'UUIDv7 unique observation ID' },
      { name: 'source_system_id', type: 'VARCHAR(64)', nullable: false, description: 'FK to source_system' },
      { name: 'job_id', type: 'UUID', nullable: false, description: 'FK to scrape_job' },
      { name: 'run_id', type: 'UUID', nullable: false, description: 'FK to scrape_run' },
      { name: 'worker_id', type: 'VARCHAR(128)', nullable: false, description: 'Worker instance ID that executed the scrape' },
      { name: 'source_url', type: 'TEXT', nullable: false, description: 'Public URL accessed' },
      { name: 'source_ad_library_id', type: 'VARCHAR(128)', nullable: false, description: 'External Meta Ad Library identifier' },
      { name: 'observed_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Timestamp when document was rendered' },
      { name: 'adapter_version', type: 'VARCHAR(32)', nullable: false, description: 'Software version of scraper adapter' },
      { name: 'extraction_schema_version', type: 'VARCHAR(32)', nullable: false, description: 'DOM selector/extraction schema version' },
      { name: 'normalization_version', type: 'VARCHAR(32)', nullable: false, description: 'Normalization logic version' },
      { name: 'collection_sequence', type: 'BIGINT', nullable: false, description: 'Monotonic sequence in run' },
      { name: 'batch_identifier', type: 'VARCHAR(128)', nullable: false, description: 'Batch envelope ID' },
      { name: 'raw_payload_hash', type: 'CHAR(64)', nullable: false, description: 'SHA-256 checksum of raw page payload' },
      { name: 'validation_status', type: 'VARCHAR(32)', nullable: false, description: 'VALID, PARTIAL, MALFORMED, REJECTED' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'source_system_id', referencesTable: 'source_system', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot delete platform definition' },
      { column: 'job_id', referencesTable: 'scrape_job', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot delete job that produced observations' },
      { column: 'run_id', referencesTable: 'scrape_run', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot delete run that produced observations' }
    ],
    uniqueConstraints: [
      { name: 'uq_source_obs_idempotency', columns: ['source_system_id', 'source_ad_library_id', 'batch_identifier'], justification: 'Prevent duplicate ingest within same batch' }
    ],
    checkConstraints: [
      { name: 'chk_source_obs_validation', expression: "validation_status IN ('VALID', 'PARTIAL', 'MALFORMED', 'REJECTED')", invariantDescription: 'Must be recognized validation status' }
    ],
    indexes: [
      { name: 'idx_source_obs_lookup', columns: ['source_system_id', 'source_ad_library_id', 'observed_at DESC'], type: 'BTREE', querySupported: 'Ad history lookup', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Fast retrieval of historical observations' },
      { name: 'idx_source_obs_run', columns: ['run_id', 'collection_sequence'], type: 'BTREE', querySupported: 'Run replay', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Sequential replay of execution runs' }
    ]
  },
  {
    name: 'raw_observation_field',
    layer: 'A_OBSERVATION',
    mutability: 'IMMUTABLE',
    retention: 'OPERATIONAL_90D',
    primaryKey: 'id',
    primaryKeyType: 'BIGINT_IDENTITY',
    description: 'Fine-grained token-level provenance for individual extracted DOM fields.',
    provenanceRule: 'Child of source_observation; retains exact CSS selector and confidence.',
    columns: [
      { name: 'id', type: 'BIGINT GENERATED ALWAYS AS IDENTITY', nullable: false, isPrimaryKey: true, description: 'Synthetic sequence PK' },
      { name: 'observation_id', type: 'UUID', nullable: false, description: 'FK to source_observation' },
      { name: 'field_name', type: 'VARCHAR(64)', nullable: false, description: 'Field name (e.g. advertiser_name, ad_body)' },
      { name: 'raw_value', type: 'TEXT', nullable: false, description: 'Unmodified extracted string' },
      { name: 'data_type', type: 'VARCHAR(32)', nullable: false, description: 'STRING, INTEGER, URL, TIMESTAMP' },
      { name: 'source_selector', type: 'TEXT', nullable: false, description: 'CSS/XPath selector used' },
      { name: 'extraction_method', type: 'VARCHAR(32)', nullable: false, description: 'DOM_QUERY, REGEX, META_TAG' },
      { name: 'classification', type: 'VARCHAR(32)', nullable: false, description: 'COMMERCIAL, TECHNICAL, DISCLAIMER' },
      { name: 'confidence', type: 'NUMERIC(4,3)', nullable: false, description: 'Field confidence 0.000 to 1.000' },
      { name: 'observed_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Extraction timestamp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'observation_id', referencesTable: 'source_observation', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot delete parent observation' }
    ],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_raw_field_conf', expression: 'confidence >= 0.000 AND confidence <= 1.000', invariantDescription: 'Confidence must be normalized 0 to 1' }
    ],
    indexes: [
      { name: 'idx_raw_field_obs_field', columns: ['observation_id', 'field_name'], type: 'BTREE', querySupported: 'Field provenance', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Lookup token provenance by field' }
    ]
  },
  {
    name: 'canonical_observation',
    layer: 'A_OBSERVATION',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Cleaned, sanitized, and normalized representation of an observation ready for entity linking.',
    provenanceRule: 'Always points to source_observation; maintains normalization version.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'UUIDv7 PK' },
      { name: 'source_observation_id', type: 'UUID', nullable: false, description: 'FK to source_observation' },
      { name: 'normalized_advertiser_name', type: 'VARCHAR(255)', nullable: false, description: 'Lowercased, stripped company name' },
      { name: 'normalized_destination_url', type: 'TEXT', nullable: true, description: 'Canonicalized landing page URL' },
      { name: 'canonical_hostname', type: 'VARCHAR(255)', nullable: true, description: 'Parsed hostname' },
      { name: 'registrable_domain', type: 'VARCHAR(255)', nullable: true, description: 'Parsed eTLD+1 domain' },
      { name: 'normalization_version', type: 'VARCHAR(32)', nullable: false, description: 'Normalization algorithm version' },
      { name: 'validation_flags', type: 'TEXT[]', nullable: false, defaultValue: "'{}'", description: 'Array of validation notices' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'source_observation_id', referencesTable: 'source_observation', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan canonical normalization' }
    ],
    uniqueConstraints: [
      { name: 'uq_canon_obs_source', columns: ['source_observation_id', 'normalization_version'], justification: 'Deterministic one-to-one normalization per version' }
    ],
    checkConstraints: [],
    indexes: [
      { name: 'idx_canon_obs_domain', columns: ['registrable_domain'], type: 'BTREE', querySupported: 'Domain grouping', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Find observations by registrable domain' }
    ]
  },

  // ==========================================
  // LAYER B: CANONICAL DOMAIN (6 TABLES)
  // ==========================================
  {
    name: 'advertiser',
    layer: 'B_CANONICAL',
    mutability: 'CURRENT_STATE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Canonical advertiser entity representing a brand running commercial campaigns.',
    provenanceRule: 'Derived from observations; historical names stored in advertiser_name_history.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Advertiser UUID' },
      { name: 'canonical_name', type: 'VARCHAR(255)', nullable: false, description: 'Current authoritative legal/brand name' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'ACTIVE'", description: 'ACTIVE, MERGED, SUSPENDED, SPLIT' },
      { name: 'first_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Earliest observation timestamp' },
      { name: 'last_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Most recent observation timestamp' },
      { name: 'resolution_version', type: 'VARCHAR(32)', nullable: false, description: 'Entity resolution engine version' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Record creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Last state change timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_adv_dates', expression: 'last_seen_at >= first_seen_at', invariantDescription: 'Temporal coherence between first and last seen' },
      { name: 'chk_adv_status', expression: "status IN ('ACTIVE', 'MERGED', 'SUSPENDED', 'SPLIT')", invariantDescription: 'Valid advertiser status' }
    ],
    indexes: [
      { name: 'idx_advertiser_name', columns: ['canonical_name'], type: 'BTREE', querySupported: 'Brand search', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Fuzzy and exact brand name search' }
    ]
  },
  {
    name: 'advertiser_name_history',
    layer: 'B_CANONICAL',
    mutability: 'IMMUTABLE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'BIGINT_IDENTITY',
    description: 'Append-only historical record of all names observed for an advertiser over time.',
    provenanceRule: 'Preserves historical name changes without overwriting the canonical entity.',
    columns: [
      { name: 'id', type: 'BIGINT GENERATED ALWAYS AS IDENTITY', nullable: false, isPrimaryKey: true, description: 'Sequence PK' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'observed_name', type: 'VARCHAR(255)', nullable: false, description: 'Observed name string' },
      { name: 'first_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'First appearance of this variant' },
      { name: 'last_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Last appearance of this variant' },
      { name: 'source_observation_id', type: 'UUID', nullable: false, description: 'FK to source_observation' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan name history' },
      { column: 'source_observation_id', referencesTable: 'source_observation', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan source observation' }
    ],
    uniqueConstraints: [
      { name: 'uq_adv_name_history', columns: ['advertiser_id', 'observed_name', 'source_observation_id'], justification: 'Deduplicate identical name observation' }
    ],
    checkConstraints: [],
    indexes: [
      { name: 'idx_adv_name_hist_adv', columns: ['advertiser_id', 'last_seen_at DESC'], type: 'BTREE', querySupported: 'Name audit', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Retrieve chronological name changes' }
    ]
  },
  {
    name: 'advertisement',
    layer: 'B_CANONICAL',
    mutability: 'CURRENT_STATE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Canonical advertisement entity mapped to an external ad library ID.',
    provenanceRule: 'Tied to an advertiser; ad creative changes are stored in ad_observation.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Ad UUID' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'source_system_id', type: 'VARCHAR(64)', nullable: false, description: 'FK to source_system' },
      { name: 'source_ad_library_id', type: 'VARCHAR(128)', nullable: false, description: 'Meta Ad Library ID' },
      { name: 'canonical_status', type: 'VARCHAR(32)', nullable: false, description: 'ACTIVE, INACTIVE, REMOVED, UNKNOWN' },
      { name: 'first_observed_at', type: 'TIMESTAMPTZ', nullable: false, description: 'First extraction timestamp' },
      { name: 'last_observed_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Latest extraction timestamp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Updated timestamp' }
    ],
    foreignKeys: [
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan ad from advertiser' },
      { column: 'source_system_id', referencesTable: 'source_system', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan ad from platform' }
    ],
    uniqueConstraints: [
      { name: 'uq_advertisement_source', columns: ['source_system_id', 'source_ad_library_id'], justification: 'Canonical uniqueness per platform ad card' }
    ],
    checkConstraints: [
      { name: 'chk_ad_status', expression: "canonical_status IN ('ACTIVE', 'INACTIVE', 'REMOVED', 'UNKNOWN')", invariantDescription: 'Valid ad status' }
    ],
    indexes: [
      { name: 'idx_ad_advertiser_timeline', columns: ['advertiser_id', 'last_observed_at DESC'], type: 'BTREE', querySupported: 'Ad roster', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Fetch all ads for an advertiser' }
    ]
  },
  {
    name: 'ad_observation',
    layer: 'B_CANONICAL',
    mutability: 'IMMUTABLE',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Snapshot of ad text, headline, CTA, and destination URL captured at a specific point in time.',
    provenanceRule: 'Never updated; allows auditing ad copy changes across campaigns.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Ad observation UUID' },
      { name: 'advertisement_id', type: 'UUID', nullable: false, description: 'FK to advertisement' },
      { name: 'source_observation_id', type: 'UUID', nullable: false, description: 'FK to source_observation' },
      { name: 'observed_body_text', type: 'TEXT', nullable: true, description: 'Ad copy body' },
      { name: 'observed_headline', type: 'TEXT', nullable: true, description: 'Ad headline' },
      { name: 'observed_cta_title', type: 'VARCHAR(128)', nullable: true, description: 'Call-to-action label' },
      { name: 'observed_destination_url', type: 'TEXT', nullable: true, description: 'Outbound landing URL' },
      { name: 'observed_media_type', type: 'VARCHAR(32)', nullable: true, description: 'IMAGE, VIDEO, CAROUSEL, TEXT_ONLY' },
      { name: 'observed_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Timestamp of snapshot' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'advertisement_id', referencesTable: 'advertisement', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan ad observation' },
      { column: 'source_observation_id', referencesTable: 'source_observation', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan observation lineage' }
    ],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: [
      { name: 'idx_ad_obs_ad_time', columns: ['advertisement_id', 'observed_at DESC'], type: 'BTREE', querySupported: 'Ad copy changes', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Audit ad copy history' }
    ]
  },
  {
    name: 'business_entity',
    layer: 'B_CANONICAL',
    mutability: 'CURRENT_STATE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Real-world commercial corporate or operating entity behind one or more advertising brands.',
    provenanceRule: 'Separated from advertisers to model parent companies and multi-brand conglomerates.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Business Entity UUID' },
      { name: 'legal_name', type: 'VARCHAR(255)', nullable: false, description: 'Registered legal entity name' },
      { name: 'commercial_brand_name', type: 'VARCHAR(255)', nullable: false, description: 'Primary trading name' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'ACTIVE'", description: 'ACTIVE, DISSOLVED, MERGED' },
      { name: 'first_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Earliest observed presence' },
      { name: 'last_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Latest verified presence' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Updated timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: [
      { name: 'idx_biz_legal_name', columns: ['legal_name'], type: 'BTREE', querySupported: 'Corporate search', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Search by registered entity name' }
    ]
  },
  {
    name: 'canonical_destination',
    layer: 'B_CANONICAL',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Verified landing page destination and domain linked to a business entity.',
    provenanceRule: 'Derived from ad outbound links; separated from transient URL tracking parameters.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Destination UUID' },
      { name: 'business_entity_id', type: 'UUID', nullable: false, description: 'FK to business_entity' },
      { name: 'target_url', type: 'TEXT', nullable: false, description: 'Normalized base landing URL' },
      { name: 'hostname', type: 'VARCHAR(255)', nullable: false, description: 'Parsed hostname' },
      { name: 'registrable_domain', type: 'VARCHAR(255)', nullable: false, description: 'Parsed eTLD+1 domain' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'true', description: 'Active destination flag' },
      { name: 'first_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'First observed date' },
      { name: 'last_seen_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Last verified date' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [
      { column: 'business_entity_id', referencesTable: 'business_entity', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan destination' }
    ],
    uniqueConstraints: [
      { name: 'uq_canon_dest_biz_domain', columns: ['business_entity_id', 'registrable_domain'], justification: 'Unique domain link per business entity' }
    ],
    checkConstraints: [],
    indexes: [
      { name: 'idx_canon_dest_domain', columns: ['registrable_domain'], type: 'BTREE', querySupported: 'Domain routing', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Find business by domain' }
    ]
  },

  // ==========================================
  // LAYER C: IDENTITY / MERGE / SPLIT (5 TABLES)
  // ==========================================
  {
    name: 'advertiser_identity_link',
    layer: 'C_IDENTITY',
    mutability: 'VERSIONED_FACT',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Resolution link connecting an advertiser to a canonical business entity with confidence score.',
    provenanceRule: 'Partial unique index guarantees exactly one ACTIVE mapping per advertiser.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Link UUID' },
      { name: 'source_advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'target_business_entity_id', type: 'UUID', nullable: false, description: 'FK to business_entity' },
      { name: 'relationship_type', type: 'VARCHAR(64)', nullable: false, description: 'DIRECT_OWNERSHIP, PARENT_SUBSIDIARY, BRAND_ALIAS' },
      { name: 'match_status', type: 'VARCHAR(32)', nullable: false, description: 'ACTIVE, SUPERSEDED, REJECTED, SPLIT' },
      { name: 'confidence_score', type: 'NUMERIC(4,3)', nullable: false, description: 'Resolution confidence 0.000 to 1.000' },
      { name: 'evidence_summary', type: 'JSONB', nullable: false, description: 'Tokens, domain match, and rule evidence' },
      { name: 'rule_version', type: 'VARCHAR(32)', nullable: false, description: 'Identity resolution rule version' },
      { name: 'is_active', type: 'BOOLEAN', nullable: false, defaultValue: 'true', description: 'Active flag for partial index' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' },
      { name: 'superseded_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Deactivation timestamp' }
    ],
    foreignKeys: [
      { column: 'source_advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan identity mapping' },
      { column: 'target_business_entity_id', referencesTable: 'business_entity', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Cannot orphan identity target' }
    ],
    uniqueConstraints: [
      { name: 'uq_active_adv_identity_link', columns: ['source_advertiser_id'], isPartial: true, whereClause: 'WHERE is_active = true', justification: 'Exactly one active identity link per advertiser' }
    ],
    checkConstraints: [
      { name: 'chk_identity_conf', expression: 'confidence_score >= 0.000 AND confidence_score <= 1.000', invariantDescription: 'Confidence must be 0 to 1' }
    ],
    indexes: [
      { name: 'idx_identity_active_link', columns: ['source_advertiser_id', 'target_business_entity_id'], type: 'BTREE', isUnique: false, whereClause: 'WHERE is_active = true', querySupported: 'Active identity lookup', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Resolve active business entity fast' }
    ]
  },
  {
    name: 'identity_candidate',
    layer: 'C_IDENTITY',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Candidate pair flagged for identity review or automated merge evaluation.',
    provenanceRule: 'Stores similarity scores and reason codes prior to merge decision.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Candidate UUID' },
      { name: 'entity_a_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'entity_b_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'similarity_score', type: 'NUMERIC(4,3)', nullable: false, description: 'Similarity metric 0 to 1' },
      { name: 'candidate_status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'PENDING'", description: 'PENDING, APPROVED, REJECTED' },
      { name: 'detection_algorithm', type: 'VARCHAR(64)', nullable: false, description: 'Algorithm code (e.g. JaroWinkler+Domain)' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Detection timestamp' }
    ],
    foreignKeys: [
      { column: 'entity_a_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Candidate entity A must exist' },
      { column: 'entity_b_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Candidate entity B must exist' }
    ],
    uniqueConstraints: [
      { name: 'uq_candidate_pair', columns: ['entity_a_id', 'entity_b_id'], justification: 'Unique candidate evaluation pair' }
    ],
    checkConstraints: [
      { name: 'chk_no_self_candidate', expression: 'entity_a_id <> entity_b_id', invariantDescription: 'Entity cannot be candidate of itself' }
    ],
    indexes: []
  },
  {
    name: 'identity_merge_event',
    layer: 'C_IDENTITY',
    mutability: 'IMMUTABLE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Immutable ledger record documenting the merge of two entities into a primary entity.',
    provenanceRule: 'Stores justification and actor; allows non-destructive rollback via split event.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Merge Event UUID' },
      { name: 'primary_entity_id', type: 'UUID', nullable: false, description: 'Surviving primary advertiser' },
      { name: 'merged_entity_id', type: 'UUID', nullable: false, description: 'Merged/absorbed advertiser' },
      { name: 'rule_version', type: 'VARCHAR(32)', nullable: false, description: 'Rule version that authorized merge' },
      { name: 'confidence_score', type: 'NUMERIC(4,3)', nullable: false, description: 'Confidence score' },
      { name: 'justification', type: 'TEXT', nullable: false, description: 'Audit rationale' },
      { name: 'performed_by', type: 'VARCHAR(128)', nullable: false, description: 'System worker or reviewer username' },
      { name: 'performed_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Execution timestamp' },
      { name: 'is_reverted', type: 'BOOLEAN', nullable: false, defaultValue: 'false', description: 'True if split subsequently executed' },
      { name: 'reverted_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Split timestamp' },
      { name: 'correlation_id', type: 'UUID', nullable: false, description: 'Audit transaction correlation ID' }
    ],
    foreignKeys: [
      { column: 'primary_entity_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Primary advertiser must exist' },
      { column: 'merged_entity_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Merged advertiser must exist' }
    ],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_no_self_merge', expression: 'primary_entity_id <> merged_entity_id', invariantDescription: 'Cannot merge entity into itself' }
    ],
    indexes: [
      { name: 'idx_merge_primary', columns: ['primary_entity_id'], type: 'BTREE', querySupported: 'Merge history', cardinality: 'MEDIUM', writeCost: 'LOW', justification: 'Find merges into primary' },
      { name: 'idx_merge_merged', columns: ['merged_entity_id'], type: 'BTREE', querySupported: 'Absorbed lineage', cardinality: 'MEDIUM', writeCost: 'LOW', justification: 'Trace absorbed entity lineage' }
    ]
  },
  {
    name: 'identity_split_event',
    layer: 'C_IDENTITY',
    mutability: 'IMMUTABLE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Immutable ledger record documenting the reversal of an erroneous merge.',
    provenanceRule: 'Re-activates split entity without destroying observation or verification history.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Split Event UUID' },
      { name: 'merge_event_id', type: 'UUID', nullable: false, description: 'FK to original identity_merge_event' },
      { name: 'split_entity_id', type: 'UUID', nullable: false, description: 'FK to restored advertiser' },
      { name: 'justification', type: 'TEXT', nullable: false, description: 'Reason for separation' },
      { name: 'performed_by', type: 'VARCHAR(128)', nullable: false, description: 'Reviewer username' },
      { name: 'performed_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Execution timestamp' },
      { name: 'correlation_id', type: 'UUID', nullable: false, description: 'Audit transaction correlation ID' }
    ],
    foreignKeys: [
      { column: 'merge_event_id', referencesTable: 'identity_merge_event', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Must reference valid merge event' },
      { column: 'split_entity_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Restored advertiser must exist' }
    ],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },
  {
    name: 'entity_relationship',
    layer: 'C_IDENTITY',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Typed semantic graph edges connecting corporate entities, subsidiaries, and agencies.',
    provenanceRule: 'Supports multi-tier corporate hierarchies.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Relationship UUID' },
      { name: 'subject_entity_id', type: 'UUID', nullable: false, description: 'Subject business entity' },
      { name: 'predicate', type: 'VARCHAR(64)', nullable: false, description: 'PARENT_OF, SUBSIDIARY_OF, OPERATES_BRAND' },
      { name: 'object_entity_id', type: 'UUID', nullable: false, description: 'Object business entity' },
      { name: 'confidence', type: 'NUMERIC(4,3)', nullable: false, description: 'Confidence 0 to 1' },
      { name: 'source_evidence_ref', type: 'TEXT', nullable: false, description: 'SEC filing, footer disclaimer, or domain match' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [
      { column: 'subject_entity_id', referencesTable: 'business_entity', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Subject entity must exist' },
      { column: 'object_entity_id', referencesTable: 'business_entity', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Object entity must exist' }
    ],
    uniqueConstraints: [
      { name: 'uq_entity_rel', columns: ['subject_entity_id', 'predicate', 'object_entity_id'], justification: 'Unique directed edge' }
    ],
    checkConstraints: [
      { name: 'chk_no_self_rel', expression: 'subject_entity_id <> object_entity_id', invariantDescription: 'No self-loops' }
    ],
    indexes: []
  },

  // ==========================================
  // LAYER D: VERIFICATION (4 TABLES)
  // ==========================================
  {
    name: 'verification_run',
    layer: 'D_VERIFICATION',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Network-level probe execution record validating landing page reachability, DNS, and SSRF compliance.',
    provenanceRule: 'Captures full network hop trace and egress IP; never overwritten in place.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Verification Run UUID' },
      { name: 'target_url', type: 'TEXT', nullable: false, description: 'Requested URL' },
      { name: 'registrable_domain', type: 'VARCHAR(255)', nullable: false, description: 'Extracted eTLD+1 domain' },
      { name: 'execution_status', type: 'VARCHAR(32)', nullable: false, description: 'SUCCESS, FAILED, BLOCKED_SSRF, TIMEOUT' },
      { name: 'http_status_code', type: 'INT', nullable: true, description: 'Terminal HTTP response code (e.g. 200)' },
      { name: 'final_resolved_url', type: 'TEXT', nullable: true, description: 'Final URL after safe redirects' },
      { name: 'tls_version', type: 'VARCHAR(32)', nullable: true, description: 'TLSv1.2, TLSv1.3' },
      { name: 'ip_egress_address', type: 'INET', nullable: true, description: 'Worker egress public IP' },
      { name: 'dns_resolved_ips', type: 'INET[]', nullable: false, defaultValue: "'{}'", description: 'Resolved IPs checked for SSRF' },
      { name: 'is_ssrf_safe', type: 'BOOLEAN', nullable: false, description: 'True if no private/banned CIDRs detected' },
      { name: 'latency_ms', type: 'INT', nullable: false, description: 'Total round-trip latency in ms' },
      { name: 'verifier_version', type: 'VARCHAR(32)', nullable: false, description: 'Verification engine release version' },
      { name: 'network_audit_log', type: 'JSONB', nullable: false, defaultValue: "'{}'::jsonb", description: 'DNS hops and SSL cert chain details' },
      { name: 'verified_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Probe completion timestamp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_verif_exec_status', expression: "execution_status IN ('SUCCESS', 'FAILED', 'BLOCKED_SSRF', 'TIMEOUT')", invariantDescription: 'Valid execution status' },
      { name: 'chk_verif_latency', expression: 'latency_ms >= 0', invariantDescription: 'Latency cannot be negative' }
    ],
    indexes: [
      { name: 'idx_verif_run_domain_recent', columns: ['registrable_domain', 'verified_at DESC'], type: 'BTREE', querySupported: 'Domain verification cache', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Fast lookup of recent domain probes' }
    ]
  },
  {
    name: 'verification_claim',
    layer: 'D_VERIFICATION',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Discrete empirical claim evaluated during verification (e.g. DOMAIN_REACHABILITY, TLS_ACTIVE).',
    provenanceRule: 'Must link to verification_run; backed by evidence snippets.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Claim UUID' },
      { name: 'verification_run_id', type: 'UUID', nullable: false, description: 'FK to verification_run' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'claim_type', type: 'VARCHAR(64)', nullable: false, description: 'DOMAIN_REACHABILITY, TLS_ACTIVE, OPEN_DOM_VERIFIED' },
      { name: 'claim_status', type: 'VARCHAR(32)', nullable: false, description: 'VERIFIED, REFUTED, AMBIGUOUS, INCONCLUSIVE' },
      { name: 'confidence', type: 'VARCHAR(16)', nullable: false, description: 'HIGH, MEDIUM, LOW, UNCERTAIN' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [
      { column: 'verification_run_id', referencesTable: 'verification_run', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Run must exist' },
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Advertiser must exist' }
    ],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_claim_status', expression: "claim_status IN ('VERIFIED', 'REFUTED', 'AMBIGUOUS', 'INCONCLUSIVE')", invariantDescription: 'Valid claim status' }
    ],
    indexes: [
      { name: 'idx_claim_adv_type', columns: ['advertiser_id', 'claim_type'], type: 'BTREE', querySupported: 'Advertiser claims', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Filter claims by advertiser' }
    ]
  },
  {
    name: 'verification_evidence',
    layer: 'D_VERIFICATION',
    mutability: 'IMMUTABLE',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Immutable artifact fragment (DOM text snippet, SSL cert, schema.org JSON) proving a claim.',
    provenanceRule: 'Stores cryptographic hash signature of raw fragment.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Evidence UUID' },
      { name: 'claim_id', type: 'UUID', nullable: false, description: 'FK to verification_claim' },
      { name: 'evidence_type', type: 'VARCHAR(64)', nullable: false, description: 'DOM_SNIPPET, TLS_CERT_CHAIN, SCHEMA_ORG_JSON' },
      { name: 'snippet_content', type: 'TEXT', nullable: true, description: 'Extracted text excerpt' },
      { name: 'parsed_structured_data', type: 'JSONB', nullable: true, description: 'Structured JSON parsed from page' },
      { name: 'hash_signature', type: 'CHAR(64)', nullable: false, description: 'SHA-256 of snippet payload' },
      { name: 'captured_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Capture timestamp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'claim_id', referencesTable: 'verification_claim', referencesColumn: 'id', onDelete: 'CASCADE', justification: 'Evidence belongs to claim' }
    ],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },
  {
    name: 'verification_conflict',
    layer: 'D_VERIFICATION',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Contradiction detected between ad disclosures and landing page destination.',
    provenanceRule: 'Triggers UNCERTAIN confidence and potential manual review queue.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Conflict UUID' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'conflict_code', type: 'VARCHAR(64)', nullable: false, description: 'NAME_MISMATCH, DOMAIN_MISMATCH, DISCLAIMER_CONTRADICTION' },
      { name: 'severity', type: 'VARCHAR(32)', nullable: false, description: 'CRITICAL, HIGH, MEDIUM, LOW' },
      { name: 'source_claim_id', type: 'UUID', nullable: false, description: 'FK to verification_claim' },
      { name: 'conflicting_claim_id', type: 'UUID', nullable: false, description: 'FK to verification_claim' },
      { name: 'description', type: 'TEXT', nullable: false, description: 'Explanation of contradiction' },
      { name: 'is_resolved', type: 'BOOLEAN', nullable: false, defaultValue: 'false', description: 'Resolution status' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Detection timestamp' }
    ],
    foreignKeys: [
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Advertiser must exist' },
      { column: 'source_claim_id', referencesTable: 'verification_claim', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Claim must exist' },
      { column: 'conflicting_claim_id', referencesTable: 'verification_claim', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Claim must exist' }
    ],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },

  // ==========================================
  // LAYER E: QUALIFICATION & SCORING (7 TABLES)
  // ==========================================
  {
    name: 'scoring_model',
    layer: 'E_QUALIFICATION',
    mutability: 'REFERENCE_CONFIG',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'VARCHAR',
    description: 'Registry of scoring algorithms and weight configurations.',
    provenanceRule: 'Semantic definition is immutable once activated; version changes require new row.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Model identifier (e.g. MODEL-V1-BALANCED)' },
      { name: 'version', type: 'VARCHAR(32)', nullable: false, description: 'SemVer release version' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, description: 'ACTIVE, SHADOW, RETIRED' },
      { name: 'description', type: 'TEXT', nullable: false, description: 'Model objective and policy notes' },
      { name: 'model_config', type: 'JSONB', nullable: false, description: 'Capped category weights and blocker rules' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' },
      { name: 'activated_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Activation timestamp' },
      { name: 'retired_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Deactivation timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [
      { name: 'uq_active_scoring_model', columns: ['id', 'version'], justification: 'Model version immutable identity' }
    ],
    checkConstraints: [
      { name: 'chk_model_status', expression: "status IN ('ACTIVE', 'SHADOW', 'RETIRED')", invariantDescription: 'Valid model status' }
    ],
    indexes: []
  },
  {
    name: 'scoring_rule',
    layer: 'E_QUALIFICATION',
    mutability: 'REFERENCE_CONFIG',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'VARCHAR',
    description: 'Specific evaluation rule or hard blocker (e.g. BLOCKER-01, BLOCKER-02).',
    provenanceRule: 'Child of scoring_model; referenced by contributions and blockers.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Rule code (e.g. BLOCKER-01-HTTP-404)' },
      { name: 'scoring_model_id', type: 'VARCHAR(64)', nullable: false, description: 'FK to scoring_model' },
      { name: 'rule_type', type: 'VARCHAR(32)', nullable: false, description: 'BLOCKER, SIGNAL, INFORMATIONAL' },
      { name: 'title', type: 'VARCHAR(128)', nullable: false, description: 'Rule title' },
      { name: 'description', type: 'TEXT', nullable: false, description: 'Requirement description' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [
      { column: 'scoring_model_id', referencesTable: 'scoring_model', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Rule belongs to model' }
    ],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_rule_type', expression: "rule_type IN ('BLOCKER', 'SIGNAL', 'INFORMATIONAL')", invariantDescription: 'Valid rule type' }
    ],
    indexes: []
  },
  {
    name: 'scoring_signal',
    layer: 'E_QUALIFICATION',
    mutability: 'REFERENCE_CONFIG',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'VARCHAR',
    description: 'Signal definition across the 4 capped categories (AD, WEB, ID, CONTACT).',
    provenanceRule: 'Defines max possible points and weight within category cap.',
    columns: [
      { name: 'id', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Signal code (e.g. SIG-AD-VOL-ACTIVE)' },
      { name: 'category', type: 'VARCHAR(64)', nullable: false, description: 'ADVERTISING_ACTIVITY, WEBSITE_DESTINATION, IDENTITY_CONSISTENCY, COMMERCIAL_CONTACTABILITY' },
      { name: 'max_points', type: 'NUMERIC(5,2)', nullable: false, description: 'Point limit' },
      { name: 'weight', type: 'NUMERIC(4,3)', nullable: false, description: 'Relative weight' },
      { name: 'description', type: 'TEXT', nullable: false, description: 'Evaluation logic' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_signal_category', expression: "category IN ('ADVERTISING_ACTIVITY', 'WEBSITE_DESTINATION', 'IDENTITY_CONSISTENCY', 'COMMERCIAL_CONTACTABILITY')", invariantDescription: 'Valid signal category' }
    ],
    indexes: []
  },
  {
    name: 'scoring_evidence_snapshot',
    layer: 'E_QUALIFICATION',
    mutability: 'IMMUTABLE',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Frozen, immutable JSONB document representing the exact evidence seen at calculation time.',
    provenanceRule: 'Content-addressable SHA-256 hash deduplication prevents drift.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Snapshot UUID' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'snapshot_hash', type: 'CHAR(64)', nullable: false, description: 'SHA-256 checksum of payload' },
      { name: 'evidence_payload', type: 'JSONB', nullable: false, description: 'Frozen inputs (ads count, http status, tokens)' },
      { name: 'captured_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Snapshot capture timestamp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Snapshot belongs to advertiser' }
    ],
    uniqueConstraints: [
      { name: 'uq_snapshot_hash', columns: ['snapshot_hash'], justification: 'Content addressable snapshot deduplication' }
    ],
    checkConstraints: [],
    indexes: []
  },
  {
    name: 'scoring_result',
    layer: 'E_QUALIFICATION',
    mutability: 'VERSIONED_FACT',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Authoritative calculated qualification state, normalized score (0-100), and confidence.',
    provenanceRule: 'Never overwritten; historical scores preserved for model benchmarking and audits.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Result UUID' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'scoring_model_id', type: 'VARCHAR(64)', nullable: false, description: 'FK to scoring_model' },
      { name: 'model_version', type: 'VARCHAR(32)', nullable: false, description: 'Model release version' },
      { name: 'evidence_snapshot_id', type: 'UUID', nullable: false, description: 'FK to scoring_evidence_snapshot' },
      { name: 'qualification_state', type: 'VARCHAR(32)', nullable: false, description: 'QUALIFIED, DISQUALIFIED, NEEDS_REVIEW, BLOCKED' },
      { name: 'total_score', type: 'NUMERIC(5,2)', nullable: false, description: 'Normalized score 0.00 to 100.00' },
      { name: 'confidence_level', type: 'VARCHAR(16)', nullable: false, description: 'HIGH, MEDIUM, LOW, UNCERTAIN' },
      { name: 'active_blockers', type: 'TEXT[]', nullable: false, defaultValue: "'{}'", description: 'Active hard blocker codes' },
      { name: 'explanation_summary', type: 'TEXT', nullable: false, description: 'Deterministic natural-language summary' },
      { name: 'calculated_at', type: 'TIMESTAMPTZ', nullable: false, description: 'Calculation timestamp' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Score belongs to advertiser' },
      { column: 'scoring_model_id', referencesTable: 'scoring_model', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Score references model' },
      { column: 'evidence_snapshot_id', referencesTable: 'scoring_evidence_snapshot', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Score references frozen snapshot' }
    ],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_score_range', expression: 'total_score >= 0.00 AND total_score <= 100.00', invariantDescription: 'Score bounded strictly between 0 and 100' },
      { name: 'chk_qual_state', expression: "qualification_state IN ('QUALIFIED', 'DISQUALIFIED', 'NEEDS_REVIEW', 'BLOCKED')", invariantDescription: 'Valid qualification state' },
      { name: 'chk_score_conf', expression: "confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN')", invariantDescription: 'Valid confidence' }
    ],
    indexes: [
      { name: 'idx_scoring_latest_state', columns: ['advertiser_id', 'calculated_at DESC', 'total_score DESC'], type: 'BTREE', querySupported: 'Latest score & prioritization', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Retrieve latest score and rank' }
    ]
  },
  {
    name: 'scoring_contribution',
    layer: 'E_QUALIFICATION',
    mutability: 'IMMUTABLE',
    retention: 'HIGH_RETENTION_7YR',
    primaryKey: 'id',
    primaryKeyType: 'BIGINT_IDENTITY',
    description: 'Detailed point contribution for every signal evaluated in a scoring result.',
    provenanceRule: 'Answers "Why did score X occur?" directly from SQL.',
    columns: [
      { name: 'id', type: 'BIGINT GENERATED ALWAYS AS IDENTITY', nullable: false, isPrimaryKey: true, description: 'Sequence PK' },
      { name: 'scoring_result_id', type: 'UUID', nullable: false, description: 'FK to scoring_result' },
      { name: 'category', type: 'VARCHAR(64)', nullable: false, description: 'ADVERTISING_ACTIVITY, WEBSITE_DESTINATION, IDENTITY_CONSISTENCY, COMMERCIAL_CONTACTABILITY' },
      { name: 'signal_code', type: 'VARCHAR(64)', nullable: false, description: 'Signal identifier' },
      { name: 'points_awarded', type: 'NUMERIC(5,2)', nullable: false, description: 'Points earned' },
      { name: 'points_possible', type: 'NUMERIC(5,2)', nullable: false, description: 'Max points' },
      { name: 'weight', type: 'NUMERIC(4,3)', nullable: false, description: 'Category weight' },
      { name: 'is_blocked', type: 'BOOLEAN', nullable: false, defaultValue: 'false', description: 'True if blocked by hard invariant' },
      { name: 'explanation_fragment', type: 'TEXT', nullable: false, description: 'Factual evidence justification' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'DB insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'scoring_result_id', referencesTable: 'scoring_result', referencesColumn: 'id', onDelete: 'CASCADE', justification: 'Contributions belong to result' }
    ],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_contribution_pts', expression: 'points_awarded >= 0.00 AND points_awarded <= points_possible', invariantDescription: 'Awarded points cannot exceed possible points' }
    ],
    indexes: [
      { name: 'idx_contrib_result_cat', columns: ['scoring_result_id', 'category'], type: 'BTREE', querySupported: 'Score explanation', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Retrieve breakdown by category' }
    ]
  },
  {
    name: 'manual_override',
    layer: 'E_QUALIFICATION',
    mutability: 'IMMUTABLE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Append-only audit record of manual human reviewer status or score adjustments.',
    provenanceRule: 'Never alters original scoring_result; records reviewer ID, reason, and policy version.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Override UUID' },
      { name: 'scoring_result_id', type: 'UUID', nullable: false, description: 'FK to original scoring_result' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'FK to advertiser' },
      { name: 'previous_state', type: 'VARCHAR(32)', nullable: false, description: 'Automated state' },
      { name: 'overridden_state', type: 'VARCHAR(32)', nullable: false, description: 'Reviewer state' },
      { name: 'previous_score', type: 'NUMERIC(5,2)', nullable: false, description: 'Automated score' },
      { name: 'overridden_score', type: 'NUMERIC(5,2)', nullable: true, description: 'Manual score adjustment' },
      { name: 'reviewer_id', type: 'VARCHAR(128)', nullable: false, description: 'Username or badge ID' },
      { name: 'reason_code', type: 'VARCHAR(64)', nullable: false, description: 'RETAIL_WALKIN_VERIFIED, MANUAL_CONTACT_CHECK' },
      { name: 'justification', type: 'TEXT', nullable: false, description: 'Reviewer commentary' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [
      { column: 'scoring_result_id', referencesTable: 'scoring_result', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Original result must exist' },
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Advertiser must exist' }
    ],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_override_state', expression: "overridden_state IN ('QUALIFIED', 'DISQUALIFIED', 'NEEDS_REVIEW', 'BLOCKED')", invariantDescription: 'Valid override state' }
    ],
    indexes: []
  },

  // ==========================================
  // LAYER F: EXECUTION & OPERATIONS (6 TABLES)
  // ==========================================
  {
    name: 'scrape_job',
    layer: 'F_EXECUTION',
    mutability: 'CURRENT_STATE',
    retention: 'OPERATIONAL_90D',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'High-level lead research request specifying search criteria and target country.',
    provenanceRule: 'Parent to execution runs; decoupled from business domain.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Job UUID' },
      { name: 'search_query', type: 'VARCHAR(255)', nullable: false, description: 'Ad Library search query' },
      { name: 'target_country', type: 'VARCHAR(8)', nullable: false, description: 'ISO 2-letter country code' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'PENDING'", description: 'PENDING, RUNNING, COMPLETED, FAILED, CANCELLED' },
      { name: 'requested_by', type: 'VARCHAR(128)', nullable: false, description: 'User or scheduler ID' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' },
      { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Updated timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_job_status', expression: "status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')", invariantDescription: 'Valid job status' }
    ],
    indexes: []
  },
  {
    name: 'scrape_run',
    layer: 'F_EXECUTION',
    mutability: 'VERSIONED_FACT',
    retention: 'OPERATIONAL_90D',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Individual execution attempt of a scrape job (supports retries and partial runs).',
    provenanceRule: 'Child of scrape_job; anchors observations.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Run UUID' },
      { name: 'job_id', type: 'UUID', nullable: false, description: 'FK to scrape_job' },
      { name: 'run_number', type: 'INT', nullable: false, description: 'Attempt index (1, 2, 3)' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'RUNNING'", description: 'RUNNING, SUCCEEDED, FAILED, ABORTED' },
      { name: 'worker_id', type: 'VARCHAR(128)', nullable: false, description: 'Worker node identifier' },
      { name: 'started_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Start time' },
      { name: 'completed_at', type: 'TIMESTAMPTZ', nullable: true, description: 'End time' },
      { name: 'records_extracted', type: 'INT', nullable: false, defaultValue: '0', description: 'Cumulative records extracted' },
      { name: 'error_summary', type: 'TEXT', nullable: true, description: 'Terminal failure message' }
    ],
    foreignKeys: [
      { column: 'job_id', referencesTable: 'scrape_job', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Job must exist' }
    ],
    uniqueConstraints: [
      { name: 'uq_job_run_number', columns: ['job_id', 'run_number'], justification: 'Unique attempt index per job' }
    ],
    checkConstraints: [],
    indexes: []
  },
  {
    name: 'scrape_checkpoint',
    layer: 'F_EXECUTION',
    mutability: 'IMMUTABLE',
    retention: 'TRANSIENT_30D',
    primaryKey: 'id',
    primaryKeyType: 'BIGINT_IDENTITY',
    description: 'Monotonic progress cursor supporting crash recovery and exactly-once processing.',
    provenanceRule: 'Enables deterministic resume from last committed sequence.',
    columns: [
      { name: 'id', type: 'BIGINT GENERATED ALWAYS AS IDENTITY', nullable: false, isPrimaryKey: true, description: 'Sequence PK' },
      { name: 'job_id', type: 'UUID', nullable: false, description: 'FK to scrape_job' },
      { name: 'run_id', type: 'UUID', nullable: false, description: 'FK to scrape_run' },
      { name: 'sequence_number', type: 'BIGINT', nullable: false, description: 'Monotonic cursor counter' },
      { name: 'cursor_token', type: 'TEXT', nullable: false, description: 'Opaque pagination cursor' },
      { name: 'batch_identifier', type: 'VARCHAR(128)', nullable: false, description: 'Batch ID' },
      { name: 'records_processed_cumulative', type: 'INT', nullable: false, description: 'Running count' },
      { name: 'checkpoint_state', type: 'JSONB', nullable: false, description: 'Worker internal cursor state' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' }
    ],
    foreignKeys: [
      { column: 'job_id', referencesTable: 'scrape_job', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Job must exist' },
      { column: 'run_id', referencesTable: 'scrape_run', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Run must exist' }
    ],
    uniqueConstraints: [
      { name: 'uq_run_sequence', columns: ['run_id', 'sequence_number'], justification: 'Unique monotonic checkpoint sequence' }
    ],
    checkConstraints: [],
    indexes: [
      { name: 'idx_checkpoint_resume', columns: ['run_id', 'sequence_number DESC'], type: 'BTREE', querySupported: 'Crash recovery resume', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Retrieve latest checkpoint' }
    ]
  },
  {
    name: 'worker',
    layer: 'F_EXECUTION',
    mutability: 'CURRENT_STATE',
    retention: 'TRANSIENT_30D',
    primaryKey: 'id',
    primaryKeyType: 'VARCHAR',
    description: 'Worker node registration and liveness heartbeat registry.',
    provenanceRule: 'Detects zombie workers and lost leases.',
    columns: [
      { name: 'id', type: 'VARCHAR(128)', nullable: false, isPrimaryKey: true, description: 'Hostname or container pod ID' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'IDLE'", description: 'IDLE, BUSY, DEAD' },
      { name: 'current_run_id', type: 'UUID', nullable: true, description: 'Active scrape_run lease' },
      { name: 'last_heartbeat_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Latest ping' },
      { name: 'worker_metadata', type: 'JSONB', nullable: false, defaultValue: "'{}'::jsonb", description: 'Node OS and IP details' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Registration timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },
  {
    name: 'worker_event',
    layer: 'F_EXECUTION',
    mutability: 'IMMUTABLE',
    retention: 'TRANSIENT_30D',
    primaryKey: 'id',
    primaryKeyType: 'BIGINT_IDENTITY',
    description: 'Operational telemetry event (heartbeats, batch completions, rate limits).',
    provenanceRule: 'Partitioned and pruned after 30 days.',
    columns: [
      { name: 'id', type: 'BIGINT GENERATED ALWAYS AS IDENTITY', nullable: false, isPrimaryKey: true, description: 'Sequence PK' },
      { name: 'worker_id', type: 'VARCHAR(128)', nullable: false, description: 'Worker ID' },
      { name: 'run_id', type: 'UUID', nullable: true, description: 'Run ID if active' },
      { name: 'event_type', type: 'VARCHAR(64)', nullable: false, description: 'BATCH_STARTED, BATCH_FINISHED, RATE_LIMITED' },
      { name: 'payload', type: 'JSONB', nullable: false, defaultValue: "'{}'::jsonb", description: 'Event parameters' },
      { name: 'occurred_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Event timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },
  {
    name: 'error_event',
    layer: 'F_EXECUTION',
    mutability: 'IMMUTABLE',
    retention: 'OPERATIONAL_90D',
    primaryKey: 'id',
    primaryKeyType: 'BIGINT_IDENTITY',
    description: 'Structured error log for worker failures, network timeouts, and selector drift.',
    provenanceRule: 'No secrets or sensitive DOM stored.',
    columns: [
      { name: 'id', type: 'BIGINT GENERATED ALWAYS AS IDENTITY', nullable: false, isPrimaryKey: true, description: 'Sequence PK' },
      { name: 'run_id', type: 'UUID', nullable: true, description: 'Run ID' },
      { name: 'error_code', type: 'VARCHAR(64)', nullable: false, description: 'SELECTOR_NOT_FOUND, TIMEOUT_ERROR, NETWORK_RESET' },
      { name: 'severity', type: 'VARCHAR(32)', nullable: false, description: 'FATAL, RECOVERABLE, WARNING' },
      { name: 'message', type: 'TEXT', nullable: false, description: 'Sanitized error message' },
      { name: 'is_retryable', type: 'BOOLEAN', nullable: false, description: 'True if safe to retry' },
      { name: 'occurred_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Occurrence timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },

  // ==========================================
  // LAYER G: AUDIT & GOVERNANCE (2 TABLES)
  // ==========================================
  {
    name: 'audit_event',
    layer: 'G_AUDIT',
    mutability: 'IMMUTABLE',
    retention: 'PERMANENT',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Central system-wide tamper-evident ledger recording all state transitions.',
    provenanceRule: 'Append-only; never updated or truncated; tied to correlation_id.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Event UUID' },
      { name: 'correlation_id', type: 'UUID', nullable: false, description: 'Cross-service trace ID' },
      { name: 'actor_id', type: 'VARCHAR(128)', nullable: false, description: 'User or worker' },
      { name: 'actor_type', type: 'VARCHAR(32)', nullable: false, description: 'SYSTEM_WORKER, HUMAN_REVIEWER, ADMINISTRATOR' },
      { name: 'operation', type: 'VARCHAR(64)', nullable: false, description: 'IDENTITY_MERGED, SCORE_CALCULATED, MANUAL_OVERRIDE' },
      { name: 'entity_type', type: 'VARCHAR(64)', nullable: false, description: 'ADVERTISER, SCORING_RESULT, VERIFICATION_RUN' },
      { name: 'entity_id', type: 'UUID', nullable: false, description: 'Target entity ID' },
      { name: 'previous_state', type: 'JSONB', nullable: true, description: 'Before state diff' },
      { name: 'new_state', type: 'JSONB', nullable: false, description: 'After state diff' },
      { name: 'reason_code', type: 'VARCHAR(64)', nullable: false, description: 'AUTOMATED_INGEST, REVIEW_VERIFICATION' },
      { name: 'rule_or_model_version', type: 'VARCHAR(32)', nullable: false, description: 'Rule or model version in effect' },
      { name: 'occurred_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: [
      { name: 'idx_audit_entity', columns: ['entity_type', 'entity_id', 'occurred_at DESC'], type: 'BTREE', querySupported: 'Entity timeline', cardinality: 'HIGH', writeCost: 'MEDIUM', justification: 'Retrieve mutation history for any entity' },
      { name: 'idx_audit_correlation', columns: ['correlation_id'], type: 'BTREE', querySupported: 'Distributed trace', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Correlate multi-table transaction mutations' }
    ]
  },
  {
    name: 'schema_version_metadata',
    layer: 'G_AUDIT',
    mutability: 'IMMUTABLE',
    retention: 'PERMANENT',
    primaryKey: 'version',
    primaryKeyType: 'VARCHAR',
    description: 'Authoritative ledger of applied database schema migrations.',
    provenanceRule: 'Guarantees migration traceability and prevents out-of-order execution.',
    columns: [
      { name: 'version', type: 'VARCHAR(64)', nullable: false, isPrimaryKey: true, description: 'Migration file version (e.g. 001_foundation)' },
      { name: 'name', type: 'VARCHAR(128)', nullable: false, description: 'Migration descriptive name' },
      { name: 'applied_by', type: 'VARCHAR(128)', nullable: false, description: 'CI/CD runner ID' },
      { name: 'checksum', type: 'CHAR(64)', nullable: false, description: 'SHA-256 of migration SQL' },
      { name: 'execution_time_ms', type: 'INT', nullable: false, description: 'Duration in milliseconds' },
      { name: 'applied_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Application timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: []
  },

  // ==========================================
  // LAYER H: EXPORT & REPORTING (2 TABLES)
  // ==========================================
  {
    name: 'export_job',
    layer: 'H_EXPORT',
    mutability: 'CURRENT_STATE',
    retention: 'OPERATIONAL_90D',
    primaryKey: 'id',
    primaryKeyType: 'UUIDv7',
    description: 'Bulk lead export batch request generated for Phase 08 reporting.',
    provenanceRule: 'Ties exported CSV/JSON files back to exact database snapshot time.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, defaultValue: 'gen_random_uuid()', description: 'Export Job UUID' },
      { name: 'filter_criteria', type: 'JSONB', nullable: false, description: 'Score thresholds, country, date ranges' },
      { name: 'format', type: 'VARCHAR(16)', nullable: false, description: 'CSV, JSON, PARQUET' },
      { name: 'status', type: 'VARCHAR(32)', nullable: false, defaultValue: "'PENDING'", description: 'PENDING, GENERATING, COMPLETED, FAILED' },
      { name: 'total_records', type: 'INT', nullable: false, defaultValue: '0', description: 'Exported row count' },
      { name: 'artifact_storage_uri', type: 'TEXT', nullable: true, description: 'Secure storage path' },
      { name: 'requested_by', type: 'VARCHAR(128)', nullable: false, description: 'Requesting user' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Creation timestamp' },
      { name: 'completed_at', type: 'TIMESTAMPTZ', nullable: true, description: 'Completion timestamp' }
    ],
    foreignKeys: [],
    uniqueConstraints: [],
    checkConstraints: [
      { name: 'chk_export_format', expression: "format IN ('CSV', 'JSON', 'PARQUET')", invariantDescription: 'Supported export formats' }
    ],
    indexes: []
  },
  {
    name: 'export_artifact_item',
    layer: 'H_EXPORT',
    mutability: 'IMMUTABLE',
    retention: 'OPERATIONAL_90D',
    primaryKey: 'id',
    primaryKeyType: 'BIGINT_IDENTITY',
    description: 'Audit mapping of individual lead records included in an exported artifact.',
    provenanceRule: 'Proves which exact scoring result was provided to an external user.',
    columns: [
      { name: 'id', type: 'BIGINT GENERATED ALWAYS AS IDENTITY', nullable: false, isPrimaryKey: true, description: 'Sequence PK' },
      { name: 'export_job_id', type: 'UUID', nullable: false, description: 'FK to export_job' },
      { name: 'advertiser_id', type: 'UUID', nullable: false, description: 'Exported advertiser' },
      { name: 'scoring_result_id', type: 'UUID', nullable: false, description: 'Scoring result at export time' },
      { name: 'score_at_export', type: 'NUMERIC(5,2)', nullable: false, description: 'Frozen exported score' },
      { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, defaultValue: 'clock_timestamp()', description: 'Insertion timestamp' }
    ],
    foreignKeys: [
      { column: 'export_job_id', referencesTable: 'export_job', referencesColumn: 'id', onDelete: 'CASCADE', justification: 'Belongs to export job' },
      { column: 'advertiser_id', referencesTable: 'advertiser', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Advertiser must exist' },
      { column: 'scoring_result_id', referencesTable: 'scoring_result', referencesColumn: 'id', onDelete: 'RESTRICT', justification: 'Result must exist' }
    ],
    uniqueConstraints: [],
    checkConstraints: [],
    indexes: [
      { name: 'idx_export_item_job', columns: ['export_job_id'], type: 'BTREE', querySupported: 'Export manifest', cardinality: 'HIGH', writeCost: 'LOW', justification: 'Fetch export manifest' }
    ]
  }
];

export const DATABASE_MIGRATIONS: DatabaseMigration[] = [
  {
    version: '001_foundation_and_enums',
    name: 'Foundation Extensions, Execution Enums, and Core Enums',
    layer: 'F_EXECUTION',
    tablesCreated: ['scrape_job', 'scrape_run', 'scrape_checkpoint', 'worker', 'schema_version_metadata'],
    zeroDowntimeSafety: 'Safe to run on empty database; uses transactional DDL.',
    rollbackPlan: 'DROP TABLE scrape_checkpoint, scrape_run, scrape_job, worker, schema_version_metadata CASCADE;',
    upSql: `-- Migration 001: Foundation Extensions & Orchestration Tables
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE schema_version_metadata (
    version VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    applied_by VARCHAR(128) NOT NULL,
    checksum CHAR(64) NOT NULL,
    execution_time_ms INT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE scrape_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query VARCHAR(255) NOT NULL,
    target_country VARCHAR(8) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    requested_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE scrape_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES scrape_job(id) ON DELETE RESTRICT,
    run_number INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'SUCCEEDED', 'FAILED', 'ABORTED')),
    worker_id VARCHAR(128) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ,
    records_extracted INT NOT NULL DEFAULT 0,
    error_summary TEXT,
    CONSTRAINT uq_job_run_number UNIQUE (job_id, run_number)
);

CREATE TABLE scrape_checkpoint (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES scrape_job(id) ON DELETE RESTRICT,
    run_id UUID NOT NULL REFERENCES scrape_run(id) ON DELETE RESTRICT,
    sequence_number BIGINT NOT NULL,
    cursor_token TEXT NOT NULL,
    batch_identifier VARCHAR(128) NOT NULL,
    records_processed_cumulative INT NOT NULL,
    checkpoint_state JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_run_sequence UNIQUE (run_id, sequence_number)
);

CREATE TABLE worker (
    id VARCHAR(128) PRIMARY KEY,
    status VARCHAR(32) NOT NULL DEFAULT 'IDLE',
    current_run_id UUID REFERENCES scrape_run(id),
    last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    worker_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);`,
    downSql: `DROP TABLE IF EXISTS worker CASCADE;
DROP TABLE IF EXISTS scrape_checkpoint CASCADE;
DROP TABLE IF EXISTS scrape_run CASCADE;
DROP TABLE IF EXISTS scrape_job CASCADE;
DROP TABLE IF EXISTS schema_version_metadata CASCADE;`
  },
  {
    version: '002_source_observations',
    name: 'Raw Public Observations and Token-Level Extraction Storage',
    layer: 'A_OBSERVATION',
    tablesCreated: ['source_system', 'source_observation', 'raw_observation_field', 'canonical_observation'],
    zeroDowntimeSafety: 'Creates new append-only tables; zero lock contention.',
    rollbackPlan: 'DROP TABLE canonical_observation, raw_observation_field, source_observation, source_system CASCADE;',
    upSql: `-- Migration 002: Layer A Observations
CREATE TABLE source_system (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    adapter_version VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

INSERT INTO source_system (id, name, adapter_version) VALUES 
('meta_ad_library', 'Meta Ad Library Scraper Adapter', 'v2.4.0');

CREATE TABLE source_observation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_system_id VARCHAR(64) NOT NULL REFERENCES source_system(id) ON DELETE RESTRICT,
    job_id UUID NOT NULL REFERENCES scrape_job(id) ON DELETE RESTRICT,
    run_id UUID NOT NULL REFERENCES scrape_run(id) ON DELETE RESTRICT,
    worker_id VARCHAR(128) NOT NULL,
    source_url TEXT NOT NULL,
    source_ad_library_id VARCHAR(128) NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    adapter_version VARCHAR(32) NOT NULL,
    extraction_schema_version VARCHAR(32) NOT NULL,
    normalization_version VARCHAR(32) NOT NULL,
    collection_sequence BIGINT NOT NULL,
    batch_identifier VARCHAR(128) NOT NULL,
    raw_payload_hash CHAR(64) NOT NULL,
    validation_status VARCHAR(32) NOT NULL CHECK (validation_status IN ('VALID', 'PARTIAL', 'MALFORMED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_source_obs_idempotency UNIQUE (source_system_id, source_ad_library_id, batch_identifier)
);

CREATE TABLE raw_observation_field (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    observation_id UUID NOT NULL REFERENCES source_observation(id) ON DELETE RESTRICT,
    field_name VARCHAR(64) NOT NULL,
    raw_value TEXT NOT NULL,
    data_type VARCHAR(32) NOT NULL,
    source_selector TEXT NOT NULL,
    extraction_method VARCHAR(32) NOT NULL,
    classification VARCHAR(32) NOT NULL,
    confidence NUMERIC(4,3) NOT NULL CHECK (confidence >= 0.000 AND confidence <= 1.000),
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE canonical_observation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_observation_id UUID NOT NULL REFERENCES source_observation(id) ON DELETE RESTRICT,
    normalized_advertiser_name VARCHAR(255) NOT NULL,
    normalized_destination_url TEXT,
    canonical_hostname VARCHAR(255),
    registrable_domain VARCHAR(255),
    normalization_version VARCHAR(32) NOT NULL,
    validation_flags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_canon_obs_source UNIQUE (source_observation_id, normalization_version)
);`,
    downSql: `DROP TABLE IF EXISTS canonical_observation CASCADE;
DROP TABLE IF EXISTS raw_observation_field CASCADE;
DROP TABLE IF EXISTS source_observation CASCADE;
DROP TABLE IF EXISTS source_system CASCADE;`
  },
  {
    version: '003_canonical_entities',
    name: 'Canonical Advertisers, Name Histories, Advertisements, and Destinations',
    layer: 'B_CANONICAL',
    tablesCreated: ['advertiser', 'advertiser_name_history', 'advertisement', 'ad_observation', 'business_entity', 'canonical_destination'],
    zeroDowntimeSafety: 'Standard relational tables; safe expansion.',
    rollbackPlan: 'DROP TABLE canonical_destination, business_entity, ad_observation, advertisement, advertiser_name_history, advertiser CASCADE;',
    upSql: `-- Migration 003: Layer B Canonical Entities
CREATE TABLE advertiser (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MERGED', 'SUSPENDED', 'SPLIT')),
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    resolution_version VARCHAR(32) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_adv_dates CHECK (last_seen_at >= first_seen_at)
);

CREATE TABLE advertiser_name_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    observed_name VARCHAR(255) NOT NULL,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    source_observation_id UUID NOT NULL REFERENCES source_observation(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_adv_name_history UNIQUE (advertiser_id, observed_name, source_observation_id)
);

CREATE TABLE advertisement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    source_system_id VARCHAR(64) NOT NULL REFERENCES source_system(id) ON DELETE RESTRICT,
    source_ad_library_id VARCHAR(128) NOT NULL,
    canonical_status VARCHAR(32) NOT NULL CHECK (canonical_status IN ('ACTIVE', 'INACTIVE', 'REMOVED', 'UNKNOWN')),
    first_observed_at TIMESTAMPTZ NOT NULL,
    last_observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_advertisement_source UNIQUE (source_system_id, source_ad_library_id)
);

CREATE TABLE ad_observation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertisement_id UUID NOT NULL REFERENCES advertisement(id) ON DELETE RESTRICT,
    source_observation_id UUID NOT NULL REFERENCES source_observation(id) ON DELETE RESTRICT,
    observed_body_text TEXT,
    observed_headline TEXT,
    observed_cta_title VARCHAR(128),
    observed_destination_url TEXT,
    observed_media_type VARCHAR(32),
    observed_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE business_entity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    legal_name VARCHAR(255) NOT NULL,
    commercial_brand_name VARCHAR(255) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE canonical_destination (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_entity_id UUID NOT NULL REFERENCES business_entity(id) ON DELETE RESTRICT,
    target_url TEXT NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    registrable_domain VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    first_seen_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_canon_dest_biz_domain UNIQUE (business_entity_id, registrable_domain)
);`,
    downSql: `DROP TABLE IF EXISTS canonical_destination CASCADE;
DROP TABLE IF EXISTS business_entity CASCADE;
DROP TABLE IF EXISTS ad_observation CASCADE;
DROP TABLE IF EXISTS advertisement CASCADE;
DROP TABLE IF EXISTS advertiser_name_history CASCADE;
DROP TABLE IF EXISTS advertiser CASCADE;`
  },
  {
    version: '004_identity_and_relationships',
    name: 'Identity Links, Partial Uniqueness, Candidate Queues, and Merge/Split Ledgers',
    layer: 'C_IDENTITY',
    tablesCreated: ['advertiser_identity_link', 'identity_candidate', 'identity_merge_event', 'identity_split_event', 'entity_relationship'],
    zeroDowntimeSafety: 'Includes partial unique index creation with zero data lock.',
    rollbackPlan: 'DROP TABLE entity_relationship, identity_split_event, identity_merge_event, identity_candidate, advertiser_identity_link CASCADE;',
    upSql: `-- Migration 004: Layer C Identity Resolution
CREATE TABLE advertiser_identity_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    target_business_entity_id UUID NOT NULL REFERENCES business_entity(id) ON DELETE RESTRICT,
    relationship_type VARCHAR(64) NOT NULL,
    match_status VARCHAR(32) NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL CHECK (confidence_score >= 0.000 AND confidence_score <= 1.000),
    evidence_summary JSONB NOT NULL,
    rule_version VARCHAR(32) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    superseded_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_active_adv_identity_link 
ON advertiser_identity_link (source_advertiser_id) 
WHERE is_active = true;

CREATE TABLE identity_candidate (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_a_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    entity_b_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    similarity_score NUMERIC(4,3) NOT NULL,
    candidate_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    detection_algorithm VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_candidate_pair UNIQUE (entity_a_id, entity_b_id),
    CONSTRAINT chk_no_self_candidate CHECK (entity_a_id <> entity_b_id)
);

CREATE TABLE identity_merge_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_entity_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    merged_entity_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    rule_version VARCHAR(32) NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL,
    justification TEXT NOT NULL,
    performed_by VARCHAR(128) NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    is_reverted BOOLEAN NOT NULL DEFAULT false,
    reverted_at TIMESTAMPTZ,
    correlation_id UUID NOT NULL,
    CONSTRAINT chk_no_self_merge CHECK (primary_entity_id <> merged_entity_id)
);

CREATE TABLE identity_split_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merge_event_id UUID NOT NULL REFERENCES identity_merge_event(id) ON DELETE RESTRICT,
    split_entity_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    justification TEXT NOT NULL,
    performed_by VARCHAR(128) NOT NULL,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    correlation_id UUID NOT NULL
);

CREATE TABLE entity_relationship (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_entity_id UUID NOT NULL REFERENCES business_entity(id) ON DELETE RESTRICT,
    predicate VARCHAR(64) NOT NULL,
    object_entity_id UUID NOT NULL REFERENCES business_entity(id) ON DELETE RESTRICT,
    confidence NUMERIC(4,3) NOT NULL,
    source_evidence_ref TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_entity_rel UNIQUE (subject_entity_id, predicate, object_entity_id),
    CONSTRAINT chk_no_self_rel CHECK (subject_entity_id <> object_entity_id)
);`,
    downSql: `DROP TABLE IF EXISTS entity_relationship CASCADE;
DROP TABLE IF EXISTS identity_split_event CASCADE;
DROP TABLE IF EXISTS identity_merge_event CASCADE;
DROP TABLE IF EXISTS identity_candidate CASCADE;
DROP TABLE IF EXISTS advertiser_identity_link CASCADE;`
  },
  {
    version: '005_verification_evidence',
    name: 'Multi-Hop Verification Runs, Network Audits, Claims, and Conflict Ledgers',
    layer: 'D_VERIFICATION',
    tablesCreated: ['verification_run', 'verification_claim', 'verification_evidence', 'verification_conflict'],
    zeroDowntimeSafety: 'Safe non-blocking addition.',
    rollbackPlan: 'DROP TABLE verification_conflict, verification_evidence, verification_claim, verification_run CASCADE;',
    upSql: `-- Migration 005: Layer D Verification
CREATE TABLE verification_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_url TEXT NOT NULL,
    registrable_domain VARCHAR(255) NOT NULL,
    execution_status VARCHAR(32) NOT NULL CHECK (execution_status IN ('SUCCESS', 'FAILED', 'BLOCKED_SSRF', 'TIMEOUT')),
    http_status_code INT,
    final_resolved_url TEXT,
    tls_version VARCHAR(32),
    ip_egress_address INET,
    dns_resolved_ips INET[] NOT NULL DEFAULT '{}',
    is_ssrf_safe BOOLEAN NOT NULL,
    latency_ms INT NOT NULL CHECK (latency_ms >= 0),
    verifier_version VARCHAR(32) NOT NULL,
    network_audit_log JSONB NOT NULL DEFAULT '{}'::jsonb,
    verified_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE verification_claim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_run_id UUID NOT NULL REFERENCES verification_run(id) ON DELETE RESTRICT,
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    claim_type VARCHAR(64) NOT NULL,
    claim_status VARCHAR(32) NOT NULL CHECK (claim_status IN ('VERIFIED', 'REFUTED', 'AMBIGUOUS', 'INCONCLUSIVE')),
    confidence VARCHAR(16) NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE verification_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES verification_claim(id) ON DELETE CASCADE,
    evidence_type VARCHAR(64) NOT NULL,
    snippet_content TEXT,
    parsed_structured_data JSONB,
    hash_signature CHAR(64) NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE verification_conflict (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    conflict_code VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    source_claim_id UUID NOT NULL REFERENCES verification_claim(id) ON DELETE RESTRICT,
    conflicting_claim_id UUID NOT NULL REFERENCES verification_claim(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);`,
    downSql: `DROP TABLE IF EXISTS verification_conflict CASCADE;
DROP TABLE IF EXISTS verification_evidence CASCADE;
DROP TABLE IF EXISTS verification_claim CASCADE;
DROP TABLE IF EXISTS verification_run CASCADE;`
  },
  {
    version: '006_qualification_and_scoring',
    name: 'Model Registry, Rules, Signals, Immutable Snapshots, and Scoring Contributions',
    layer: 'E_QUALIFICATION',
    tablesCreated: ['scoring_model', 'scoring_rule', 'scoring_signal', 'scoring_evidence_snapshot', 'scoring_result', 'scoring_contribution', 'manual_override'],
    zeroDowntimeSafety: 'Purely additive; model configurations seeded.',
    rollbackPlan: 'DROP TABLE manual_override, scoring_contribution, scoring_result, scoring_evidence_snapshot, scoring_signal, scoring_rule, scoring_model CASCADE;',
    upSql: `-- Migration 006: Layer E Qualification & Scoring
CREATE TABLE scoring_model (
    id VARCHAR(64) PRIMARY KEY,
    version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('ACTIVE', 'SHADOW', 'RETIRED')),
    description TEXT NOT NULL,
    model_config JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    activated_at TIMESTAMPTZ,
    retired_at TIMESTAMPTZ,
    CONSTRAINT uq_active_scoring_model UNIQUE (id, version)
);

CREATE TABLE scoring_rule (
    id VARCHAR(64) PRIMARY KEY,
    scoring_model_id VARCHAR(64) NOT NULL REFERENCES scoring_model(id) ON DELETE RESTRICT,
    rule_type VARCHAR(32) NOT NULL CHECK (rule_type IN ('BLOCKER', 'SIGNAL', 'INFORMATIONAL')),
    title VARCHAR(128) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE scoring_signal (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(64) NOT NULL CHECK (category IN ('ADVERTISING_ACTIVITY', 'WEBSITE_DESTINATION', 'IDENTITY_CONSISTENCY', 'COMMERCIAL_CONTACTABILITY')),
    max_points NUMERIC(5,2) NOT NULL,
    weight NUMERIC(4,3) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE scoring_evidence_snapshot (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    snapshot_hash CHAR(64) NOT NULL,
    evidence_payload JSONB NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_snapshot_hash UNIQUE (snapshot_hash)
);

CREATE TABLE scoring_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    scoring_model_id VARCHAR(64) NOT NULL REFERENCES scoring_model(id) ON DELETE RESTRICT,
    model_version VARCHAR(32) NOT NULL,
    evidence_snapshot_id UUID NOT NULL REFERENCES scoring_evidence_snapshot(id) ON DELETE RESTRICT,
    qualification_state VARCHAR(32) NOT NULL CHECK (qualification_state IN ('QUALIFIED', 'DISQUALIFIED', 'NEEDS_REVIEW', 'BLOCKED')),
    total_score NUMERIC(5,2) NOT NULL CHECK (total_score >= 0.00 AND total_score <= 100.00),
    confidence_level VARCHAR(16) NOT NULL CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW', 'UNCERTAIN')),
    active_blockers TEXT[] NOT NULL DEFAULT '{}',
    explanation_summary TEXT NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE scoring_contribution (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    scoring_result_id UUID NOT NULL REFERENCES scoring_result(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL CHECK (category IN ('ADVERTISING_ACTIVITY', 'WEBSITE_DESTINATION', 'IDENTITY_CONSISTENCY', 'COMMERCIAL_CONTACTABILITY')),
    signal_code VARCHAR(64) NOT NULL,
    points_awarded NUMERIC(5,2) NOT NULL,
    points_possible NUMERIC(5,2) NOT NULL,
    weight NUMERIC(4,3) NOT NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    explanation_fragment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_contribution_pts CHECK (points_awarded >= 0.00 AND points_awarded <= points_possible)
);

CREATE TABLE manual_override (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scoring_result_id UUID NOT NULL REFERENCES scoring_result(id) ON DELETE RESTRICT,
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    previous_state VARCHAR(32) NOT NULL,
    overridden_state VARCHAR(32) NOT NULL CHECK (overridden_state IN ('QUALIFIED', 'DISQUALIFIED', 'NEEDS_REVIEW', 'BLOCKED')),
    previous_score NUMERIC(5,2) NOT NULL,
    overridden_score NUMERIC(5,2),
    reviewer_id VARCHAR(128) NOT NULL,
    reason_code VARCHAR(64) NOT NULL,
    justification TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);`,
    downSql: `DROP TABLE IF EXISTS manual_override CASCADE;
DROP TABLE IF EXISTS scoring_contribution CASCADE;
DROP TABLE IF EXISTS scoring_result CASCADE;
DROP TABLE IF EXISTS scoring_evidence_snapshot CASCADE;
DROP TABLE IF EXISTS scoring_signal CASCADE;
DROP TABLE IF EXISTS scoring_rule CASCADE;
DROP TABLE IF EXISTS scoring_model CASCADE;`
  },
  {
    version: '007_execution_and_checkpoints',
    name: 'Operational Events, Telemetry Logs, and Error Catalog',
    layer: 'F_EXECUTION',
    tablesCreated: ['worker_event', 'error_event'],
    zeroDowntimeSafety: 'Creates operational tables with partitioning readiness.',
    rollbackPlan: 'DROP TABLE error_event, worker_event CASCADE;',
    upSql: `-- Migration 007: Operational Logs
CREATE TABLE worker_event (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    worker_id VARCHAR(128) NOT NULL,
    run_id UUID REFERENCES scrape_run(id),
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE error_event (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id UUID REFERENCES scrape_run(id),
    error_code VARCHAR(64) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    is_retryable BOOLEAN NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);`,
    downSql: `DROP TABLE IF EXISTS error_event CASCADE;
DROP TABLE IF EXISTS worker_event CASCADE;`
  },
  {
    version: '008_audit_views_and_reporting',
    name: 'Tamper-Evident Audit Ledger, Current State Views, and Phase 08 Read Models',
    layer: 'G_AUDIT',
    tablesCreated: ['audit_event', 'export_job', 'export_artifact_item'],
    zeroDowntimeSafety: 'Installs non-blocking views and final audit ledgers.',
    rollbackPlan: 'DROP VIEW v_lead_research_current; DROP TABLE export_artifact_item, export_job, audit_event CASCADE;',
    upSql: `-- Migration 008: Audit Log and Reporting Views
CREATE TABLE audit_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL,
    actor_id VARCHAR(128) NOT NULL,
    actor_type VARCHAR(32) NOT NULL,
    operation VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    previous_state JSONB,
    new_state JSONB NOT NULL,
    reason_code VARCHAR(64) NOT NULL,
    rule_or_model_version VARCHAR(32) NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_audit_entity ON audit_event (entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_audit_correlation ON audit_event (correlation_id);

CREATE TABLE export_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filter_criteria JSONB NOT NULL,
    format VARCHAR(16) NOT NULL CHECK (format IN ('CSV', 'JSON', 'PARQUET')),
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    total_records INT NOT NULL DEFAULT 0,
    artifact_storage_uri TEXT,
    requested_by VARCHAR(128) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE export_artifact_item (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    export_job_id UUID NOT NULL REFERENCES export_job(id) ON DELETE CASCADE,
    advertiser_id UUID NOT NULL REFERENCES advertiser(id) ON DELETE RESTRICT,
    scoring_result_id UUID NOT NULL REFERENCES scoring_result(id) ON DELETE RESTRICT,
    score_at_export NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Authoritative Read Model View for Phase 08
CREATE OR REPLACE VIEW v_lead_research_current AS
SELECT 
    a.id AS advertiser_id,
    a.canonical_name,
    a.status AS advertiser_status,
    ad.source_ad_library_id,
    COUNT(DISTINCT ad.id) AS active_ad_count,
    MAX(ad.last_observed_at) AS last_ad_observed_at,
    cd.target_url AS primary_destination_url,
    cd.registrable_domain,
    vr.execution_status AS latest_verification_status,
    vr.is_ssrf_safe,
    sr.qualification_state,
    sr.total_score,
    sr.confidence_level,
    sr.active_blockers,
    sr.model_version AS scoring_model_version,
    sr.calculated_at AS score_calculated_at
FROM advertiser a
LEFT JOIN advertisement ad ON a.id = ad.advertiser_id
LEFT JOIN advertiser_identity_link ail ON a.id = ail.source_advertiser_id AND ail.is_active = true
LEFT JOIN business_entity be ON ail.target_business_entity_id = be.id
LEFT JOIN canonical_destination cd ON be.id = cd.business_entity_id
LEFT JOIN LATERAL (
    SELECT * FROM verification_run 
    WHERE registrable_domain = cd.registrable_domain 
    ORDER BY verified_at DESC LIMIT 1
) vr ON true
LEFT JOIN LATERAL (
    SELECT * FROM scoring_result 
    WHERE advertiser_id = a.id 
    ORDER BY calculated_at DESC LIMIT 1
) sr ON true
GROUP BY a.id, a.canonical_name, a.status, ad.source_ad_library_id, cd.target_url, cd.registrable_domain, vr.execution_status, vr.is_ssrf_safe, sr.qualification_state, sr.total_score, sr.confidence_level, sr.active_blockers, sr.model_version, sr.calculated_at;`,
    downSql: `DROP VIEW IF EXISTS v_lead_research_current;
DROP TABLE IF EXISTS export_artifact_item CASCADE;
DROP TABLE IF EXISTS export_job CASCADE;
DROP TABLE IF EXISTS audit_event CASCADE;`
  }
];
