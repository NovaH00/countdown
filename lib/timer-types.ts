export interface TimerState {
  isRunning: boolean
  endAt: number | null
  forcedEventIndex: number | null
}
