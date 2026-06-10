import { promises as fs } from "fs"
import path from "path"
import type { TimerState } from "./timer-types"

export type { TimerState }
export { calculateRemainingMs } from "./timer-types"

const timerPath = path.join(process.cwd(), "data", "timer-state.json")

export async function getTimerState(): Promise<TimerState> {
  try {
    const raw = await fs.readFile(timerPath, "utf-8")
    return JSON.parse(raw)
  } catch {
    return { endAt: null, remainingMs: 0, isRunning: false }
  }
}

export async function setTimerState(state: TimerState): Promise<void> {
  await fs.writeFile(timerPath, JSON.stringify(state, null, 2), "utf-8")
}
