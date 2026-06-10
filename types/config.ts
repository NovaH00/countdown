export interface TimelineEvent {
  name: string
  endTime: string
}

export interface CountdownConfig {
  title: string
  timeline: TimelineEvent[]
  enabledUnits: {
    days: boolean
    hours: boolean
    minutes: boolean
    seconds: boolean
  }
  bgColor: string
  accentColor: string
}
