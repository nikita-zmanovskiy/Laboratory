import type { RequestLog } from './models'

export type WsBroadcastEvent =
    | {
          kind: 'new_log'
          classroomCode: string
          log: RequestLog
      }
    | {
          kind: 'classroom_closed'
          classroomCode: string
          reason: string
      }
    | {
          kind: 'classroom_extended'
          classroomCode: string
          newExpiresAt: string
      }
