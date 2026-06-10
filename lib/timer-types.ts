export interface TimerState {
  endAt: number | null
  remainingMs: number
  isRunning: boolean
}

export function calculateRemainingMs(state: TimerState): number {
  if (state.isRunning && state.endAt) {
    return Math.max(0, state.endAt - Date.now())
  }
  return state.remainingMs
}
