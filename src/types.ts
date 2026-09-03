export type SurveyStatus = 'draft' | 'queued' | 'synced'

export interface SurveyRecord {
  id: string
  facilityName: string
  building: string
  inspectorName: string
  inspectionDate: string
  condition: 'good' | 'fair' | 'poor' | 'critical'
  category: 'classroom' | 'lab' | 'restroom' | 'electrical' | 'plumbing' | 'other'
  notes: string
  photoDataUrl?: string
  gpsLat?: number
  gpsLng?: number
  status: SurveyStatus
  createdAt: string
  updatedAt: string
}

export interface SyncResult {
  synced: number
  failed: number
}

export const FACILITY_BUILDINGS = [
  'Block A — Engineering',
  'Block B — IT & CS',
  'Block C — Administration',
  'Library',
  'Cafeteria',
  'Sports Complex',
  'Dormitory Zone'
] as const

export const CONDITION_LABELS: Record<SurveyRecord['condition'], string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  critical: 'Critical'
}

export const CATEGORY_LABELS: Record<SurveyRecord['category'], string> = {
  classroom: 'Classroom',
  lab: 'Laboratory',
  restroom: 'Restroom',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  other: 'Other'
}
