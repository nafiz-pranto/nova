import { 
  SimulatedTransactionResult, 
  TransactionStepLog, 
  TransactionType,
  LeadResearchReadModel
} from '../types';
import { SAMPLE_READ_MODELS } from '../data/phase07FixturesAndAudit';

export interface SimulatedDbRecord {
  id: string;
  table: string;
  data: Record<string, any>;
  createdAt: string;
}

export class DatabaseSimulatorEngine {
  private records: Map<string, SimulatedDbRecord> = new Map();
  private readModels: LeadResearchReadModel[] = [...SAMPLE_READ_MODELS];
  private transactionHistory: SimulatedTransactionResult[] = [];

  constructor() {
    this.seedInitialState();
  }

  private seedInitialState() {
    // Seed initial records for testing
    this.records.set('adv-001-apex', {
      id: 'adv-001-apex',
      table: 'advertiser',
      data: {
        canonical_name: 'Apex Legal Partners LLC',
        status: 'ACTIVE',
        resolution_version: 'res-v2.1',
        first_seen_at: '2026-08-04T12:00:00Z',
        last_seen_at: '2026-09-15T18:24:14Z'
      },
      createdAt: '2026-08-04T12:00:00Z'
    });

    this.records.set('adv-002-solaris', {
      id: 'adv-002-solaris',
      table: 'advertiser',
      data: {
        canonical_name: 'Solaris Home Energy Group',
        status: 'ACTIVE',
        resolution_version: 'res-v2.1',
        first_seen_at: '2026-06-15T09:00:00Z',
        last_seen_at: '2026-09-15T18:24:14Z'
      },
      createdAt: '2026-06-15T09:00:00Z'
    });

    this.records.set('adv-003-omni', {
      id: 'adv-003-omni',
      table: 'advertiser',
      data: {
        canonical_name: 'OmniChannel Direct B2B',
        status: 'ACTIVE',
        resolution_version: 'res-v2.1',
        first_seen_at: '2026-09-01T10:00:00Z',
        last_seen_at: '2026-09-15T18:24:14Z'
      },
      createdAt: '2026-09-01T10:00:00Z'
    });
  }

  public getReadModels(): LeadResearchReadModel[] {
    return [...this.readModels];
  }

  public getTransactionHistory(): SimulatedTransactionResult[] {
    return [...this.transactionHistory];
  }

  /**
   * Simulates an Atomic Entity Merge Transaction
   */
  public executeAtomicMerge(
    primaryId: string, 
    mergedId: string, 
    reviewer: string, 
    justification: string,
    simulateFailureAtStep?: number
  ): SimulatedTransactionResult {
    const txId = `tx-merge-${Date.now().toString(36)}`;
    const correlationId = `corr-${Math.random().toString(36).substring(2, 10)}`;
    const startedAt = new Date().toISOString();
    const stepLogs: TransactionStepLog[] = [];
    const affectedTables: string[] = ['advertiser', 'advertiser_identity_link', 'identity_merge_event', 'audit_event'];

    // Invariant 1: Self-merge check (CHECK constraint chk_no_self_merge)
    if (primaryId === mergedId) {
      return {
        transactionId: txId,
        transactionType: 'IDENTITY_MERGE',
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'ROLLED_BACK',
        rollbackReason: 'CHECK constraint violation: chk_no_self_merge (primary_entity_id <> merged_entity_id).',
        affectedTables: [],
        stepLogs: [
          {
            step: 1,
            operation: 'VALIDATE_IDENTITIES',
            table: 'identity_merge_event',
            recordId: primaryId,
            action: 'VALIDATE',
            status: 'ROLLED_BACK',
            details: 'Entity cannot be merged into itself.'
          }
        ],
        correlationId
      };
    }

    try {
      // Step 1: Row lock acquisition
      stepLogs.push({
        step: 1,
        operation: 'ACQUIRE_ROW_LOCKS',
        table: 'advertiser',
        recordId: `${primaryId}, ${mergedId}`,
        action: 'UPDATE',
        status: 'COMMITTED',
        details: 'Acquired exclusive row-level locks (SELECT ... FOR UPDATE) on primary and target entities.'
      });
      if (simulateFailureAtStep === 1) throw new Error('Simulated network failure while acquiring row lock');

      // Step 2: Validate existing statuses
      const primaryRec = this.records.get(primaryId);
      const mergedRec = this.records.get(mergedId);

      if (!primaryRec || !mergedRec) {
        throw new Error('Foreign key violation: One or both advertiser entities do not exist.');
      }
      if (mergedRec.data.status === 'MERGED') {
        throw new Error('Invalid state: Target entity is already in MERGED status.');
      }

      stepLogs.push({
        step: 2,
        operation: 'VERIFY_REFERENTIAL_INTEGRITY',
        table: 'advertiser',
        recordId: mergedId,
        action: 'VALIDATE',
        status: 'COMMITTED',
        details: 'Verified both entities exist and target is currently ACTIVE.'
      });
      if (simulateFailureAtStep === 2) throw new Error('Simulated crash during referential integrity validation');

      // Step 3: Insert identity_merge_event
      const mergeEventId = `merge-${Date.now().toString(36)}`;
      this.records.set(mergeEventId, {
        id: mergeEventId,
        table: 'identity_merge_event',
        data: {
          primary_entity_id: primaryId,
          merged_entity_id: mergedId,
          rule_version: 'rule-merge-v2.2',
          confidence_score: 0.94,
          justification,
          performed_by: reviewer,
          is_reverted: false,
          correlation_id: correlationId
        },
        createdAt: new Date().toISOString()
      });

      stepLogs.push({
        step: 3,
        operation: 'INSERT_MERGE_LEDGER',
        table: 'identity_merge_event',
        recordId: mergeEventId,
        action: 'INSERT',
        status: 'COMMITTED',
        details: `Inserted immutable merge ledger record referencing rule rule-merge-v2.2.`
      });
      if (simulateFailureAtStep === 3) throw new Error('Simulated database write timeout on identity_merge_event');

      // Step 4: Deactivate previous identity links (Enforces partial unique constraint)
      stepLogs.push({
        step: 4,
        operation: 'DEACTIVATE_PREVIOUS_LINKS',
        table: 'advertiser_identity_link',
        recordId: mergedId,
        action: 'UPDATE',
        status: 'COMMITTED',
        details: 'Updated previous active identity links to is_active = false, match_status = SUPERSEDED.'
      });
      if (simulateFailureAtStep === 4) throw new Error('Simulated deadlock during partial unique index update');

      // Step 5: Update merged advertiser status
      mergedRec.data.status = 'MERGED';
      mergedRec.data.updated_at = new Date().toISOString();

      stepLogs.push({
        step: 5,
        operation: 'UPDATE_ADVERTISER_STATUS',
        table: 'advertiser',
        recordId: mergedId,
        action: 'UPDATE',
        status: 'COMMITTED',
        details: `Transitioned advertiser ${mergedId} status to MERGED.`
      });
      if (simulateFailureAtStep === 5) throw new Error('Simulated disk full error updating advertiser entity');

      // Step 6: Append tamper-evident audit log
      const auditId = `audit-${Date.now().toString(36)}`;
      stepLogs.push({
        step: 6,
        operation: 'EMIT_AUDIT_EVENT',
        table: 'audit_event',
        recordId: auditId,
        action: 'AUDIT',
        status: 'COMMITTED',
        details: `Appended audit_event with correlation_id ${correlationId} recording state diff.`
      });

      // Update read model
      this.readModels = this.readModels.map(rm => {
        if (rm.advertiserId === mergedId) {
          return { ...rm, status: 'MERGED', auditTrailCount: rm.auditTrailCount + 1 };
        }
        if (rm.advertiserId === primaryId) {
          return { ...rm, activeAdCount: rm.activeAdCount + 3, auditTrailCount: rm.auditTrailCount + 1 };
        }
        return rm;
      });

      const result: SimulatedTransactionResult = {
        transactionId: txId,
        transactionType: 'IDENTITY_MERGE',
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'COMMITTED',
        affectedTables,
        stepLogs,
        auditEventId: auditId,
        correlationId
      };
      this.transactionHistory.unshift(result);
      return result;

    } catch (err: any) {
      // Rollback! Invert changes and return failure
      const result: SimulatedTransactionResult = {
        transactionId: txId,
        transactionType: 'IDENTITY_MERGE',
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'ROLLED_BACK',
        rollbackReason: err?.message || 'Unknown transaction abort error',
        affectedTables,
        stepLogs: stepLogs.map(s => ({ ...s, status: 'ROLLED_BACK' })),
        correlationId
      };
      this.transactionHistory.unshift(result);
      return result;
    }
  }

  /**
   * Simulates an Atomic Identity Split (Reversing a Merge)
   */
  public executeAtomicSplit(
    mergedEntityId: string,
    reviewer: string,
    justification: string
  ): SimulatedTransactionResult {
    const txId = `tx-split-${Date.now().toString(36)}`;
    const correlationId = `corr-${Math.random().toString(36).substring(2, 10)}`;
    const startedAt = new Date().toISOString();
    const stepLogs: TransactionStepLog[] = [];
    const affectedTables = ['advertiser', 'identity_split_event', 'advertiser_identity_link', 'audit_event'];

    const targetRec = this.records.get(mergedEntityId);
    if (!targetRec || targetRec.data.status !== 'MERGED') {
      return {
        transactionId: txId,
        transactionType: 'IDENTITY_SPLIT',
        startedAt,
        completedAt: new Date().toISOString(),
        status: 'ROLLED_BACK',
        rollbackReason: 'Entity is not currently in MERGED state; cannot split.',
        affectedTables: [],
        stepLogs: [],
        correlationId
      };
    }

    // Step 1: Insert split event
    const splitId = `split-${Date.now().toString(36)}`;
    stepLogs.push({
      step: 1,
      operation: 'INSERT_SPLIT_LEDGER',
      table: 'identity_split_event',
      recordId: splitId,
      action: 'INSERT',
      status: 'COMMITTED',
      details: `Inserted split event reversing merge with justification: ${justification}`
    });

    // Step 2: Restore entity status
    targetRec.data.status = 'ACTIVE';
    targetRec.data.updated_at = new Date().toISOString();
    stepLogs.push({
      step: 2,
      operation: 'RESTORE_ENTITY_STATUS',
      table: 'advertiser',
      recordId: mergedEntityId,
      action: 'UPDATE',
      status: 'COMMITTED',
      details: 'Restored advertiser status back to ACTIVE.'
    });

    // Step 3: Re-activate independent identity link
    stepLogs.push({
      step: 3,
      operation: 'RESTORE_IDENTITY_LINK',
      table: 'advertiser_identity_link',
      recordId: mergedEntityId,
      action: 'INSERT',
      status: 'COMMITTED',
      details: 'Restored independent identity link without losing observation provenance.'
    });

    // Step 4: Audit log
    const auditId = `audit-${Date.now().toString(36)}`;
    stepLogs.push({
      step: 4,
      operation: 'EMIT_AUDIT_EVENT',
      table: 'audit_event',
      recordId: auditId,
      action: 'AUDIT',
      status: 'COMMITTED',
      details: `Emitted audit event recording entity split.`
    });

    // Update read model
    this.readModels = this.readModels.map(rm => {
      if (rm.advertiserId === mergedEntityId) {
        return { ...rm, status: 'ACTIVE', auditTrailCount: rm.auditTrailCount + 1 };
      }
      return rm;
    });

    const result: SimulatedTransactionResult = {
      transactionId: txId,
      transactionType: 'IDENTITY_SPLIT',
      startedAt,
      completedAt: new Date().toISOString(),
      status: 'COMMITTED',
      affectedTables,
      stepLogs,
      auditEventId: auditId,
      correlationId
    };
    this.transactionHistory.unshift(result);
    return result;
  }

  /**
   * Simulates Manual Reviewer Override
   */
  public executeManualOverride(
    advertiserId: string,
    newState: 'QUALIFIED' | 'DISQUALIFIED' | 'NEEDS_REVIEW' | 'BLOCKED',
    newScore: number,
    reviewerId: string,
    reasonCode: string,
    justification: string
  ): SimulatedTransactionResult {
    const txId = `tx-override-${Date.now().toString(36)}`;
    const correlationId = `corr-${Math.random().toString(36).substring(2, 10)}`;
    const startedAt = new Date().toISOString();
    const overrideId = `ovr-${Date.now().toString(36)}`;

    const stepLogs: TransactionStepLog[] = [
      {
        step: 1,
        operation: 'VERIFY_OPTIMISTIC_TOKEN',
        table: 'scoring_result',
        recordId: advertiserId,
        action: 'VALIDATE',
        status: 'COMMITTED',
        details: 'Checked advertiser revision token. No concurrent modifications detected.'
      },
      {
        step: 2,
        operation: 'INSERT_MANUAL_OVERRIDE',
        table: 'manual_override',
        recordId: overrideId,
        action: 'INSERT',
        status: 'COMMITTED',
        details: `Appended override record setting state to ${newState} (Score: ${newScore}). Previous score preserved.`
      },
      {
        step: 3,
        operation: 'EMIT_AUDIT_EVENT',
        table: 'audit_event',
        recordId: `audit-${Date.now().toString(36)}`,
        action: 'AUDIT',
        status: 'COMMITTED',
        details: `Recorded audit_event by reviewer ${reviewerId} with reason code ${reasonCode}.`
      }
    ];

    // Update read model
    this.readModels = this.readModels.map(rm => {
      if (rm.advertiserId === advertiserId) {
        return {
          ...rm,
          qualificationState: newState,
          score: newScore,
          auditTrailCount: rm.auditTrailCount + 1,
          lastCalculatedAt: new Date().toISOString()
        };
      }
      return rm;
    });

    const result: SimulatedTransactionResult = {
      transactionId: txId,
      transactionType: 'MANUAL_OVERRIDE',
      startedAt,
      completedAt: new Date().toISOString(),
      status: 'COMMITTED',
      affectedTables: ['manual_override', 'audit_event', 'v_lead_research_current'],
      stepLogs,
      auditEventId: stepLogs[2].recordId,
      correlationId
    };
    this.transactionHistory.unshift(result);
    return result;
  }
}

export const dbSimulator = new DatabaseSimulatorEngine();
