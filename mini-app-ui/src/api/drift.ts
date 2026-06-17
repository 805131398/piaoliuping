import { http } from '@/http/http'

export type DriftBottleMood = 'HAPPY' | 'LONELY' | 'CURIOUS'
export type DriftContentType = 'TEXT' | 'VOICE' | 'IMAGE'

export interface ThrowDriftBottlePayload {
  contentType: DriftContentType
  textContent?: string
  mediaUrl?: string
  mediaDurationSec?: number
  mood?: DriftBottleMood
  isAnonymous?: boolean
  showDistance?: boolean
}

export interface ThrowDriftBottleResult {
  bottle: {
    id: string
    contentType: DriftContentType
    textContent?: string | null
    mediaUrl?: string | null
    mediaDurationSec?: number | null
    mood?: DriftBottleMood | null
    status: string
    createdAt: string
  }
  remainingThrows?: number
}

export interface DriftBottleTag {
  id: string
  code: string
  name: string
  color?: string | null
}

export interface DriftBottleDetail {
  id: string
  title?: string | null
  contentType: DriftContentType
  textContent?: string | null
  mediaUrl?: string | null
  mediaDurationSec?: number | null
  mood?: DriftBottleMood | null
  isAnonymous: boolean
  discoveryCount: number
  replyCount: number
  lastDriftedAt: string
  createdAt: string
  tags: DriftBottleTag[]
}

export interface DriftDiscovery {
  id: string
  openedAt: string
  action?: string
}

export interface DrawDriftBottleResult {
  discovery: DriftDiscovery
  bottle: DriftBottleDetail
  remainingDraws?: number
}

export type DrawDriftBottleStatus = 'FOUND' | 'EMPTY' | 'LIMIT_EXCEEDED'

export interface DrawDriftBottleResponse {
  code: number
  status: DrawDriftBottleStatus
  msg: string
  data: DrawDriftBottleResult | null
}

export function throwDriftBottle(data: ThrowDriftBottlePayload) {
  return http.post<ThrowDriftBottleResult>('/api/drift/bottles', data)
}

export function drawDriftBottle() {
  return http.post<DrawDriftBottleResponse>('/api/drift/bottles/draw', undefined, undefined, undefined, {
    rawResponse: true,
    hideErrorToast: true,
  })
}

export function getDriftDiscovery(id: string) {
  return http.get<DrawDriftBottleResult>(`/api/drift/discoveries/${id}`)
}
