export type TimerType = "datetime" | "duration"

export interface SubjectConfig {
  name: string
  durationMinutes: number
}

export interface CountdownConfig {
  timerType: TimerType
  title: string
  message: string
  eventDate: string
  durationMinutes: number
  enabledUnits: {
    days: boolean
    hours: boolean
    minutes: boolean
    seconds: boolean
  }
  bgColor: string
  accentColor: string
  subjects: SubjectConfig[]
}
