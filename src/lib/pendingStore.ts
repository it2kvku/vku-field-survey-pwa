import type { SurveyRecord } from '../types'

const SNAPSHOT_KEY = 'vku-d1-snapshot'
const PENDING_KEY = 'vku-d1-pending'

export type PendingOp =
  | { type: 'upsert'; record: SurveyRecord }
  | { type: 'delete'; id: string }

export function readSnapshot(): SurveyRecord[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    return raw ? (JSON.parse(raw) as SurveyRecord[]) : []
  } catch {
    return []
  }
}

export function writeSnapshot(records: SurveyRecord[]) {
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(records))
}

export function readPending(): PendingOp[] {
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    return raw ? (JSON.parse(raw) as PendingOp[]) : []
  } catch {
    return []
  }
}

export function writePending(ops: PendingOp[]) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(ops))
}

export function enqueuePending(op: PendingOp) {
  const next = readPending().filter((item) => {
    if (op.type === 'delete') return !(item.type === 'upsert' && item.record.id === op.id)
    if (item.type === 'delete') return item.id !== op.record.id
    return item.record.id !== op.record.id
  })
  next.push(op)
  writePending(next)
}

export function mergeSnapshotAndPending(
  snapshot: SurveyRecord[],
  pending: PendingOp[]
): SurveyRecord[] {
  const map = new Map(snapshot.map((record) => [record.id, record]))
  for (const op of pending) {
    if (op.type === 'delete') map.delete(op.id)
    else map.set(op.record.id, op.record)
  }
  return [...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
