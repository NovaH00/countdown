export interface TimelineEvent {
  name: string
  endTime: string
}

export interface RedirectButton {
  name: string
  link: string
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
  activeScreen?: "countdown" | "redirects"
  redirects?: RedirectButton[]
  redirectsTitle?: string
}
