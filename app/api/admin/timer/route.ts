import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getConfig } from "@/lib/config"
import { getTimerState, setTimerState } from "@/lib/timer"
import { broadcast } from "@/lib/sse"

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const state = await getTimerState()
  return NextResponse.json(state)
}

export async function POST(request: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { action } = await request.json()
  const state = await getTimerState()

  const config = await getConfig()

  switch (action) {
    case "start": {
      if (config.timerType === "duration") {
        const durationMs = config.durationMinutes * 60 * 1000
        state.endAt = Date.now() + durationMs
        state.remainingMs = durationMs
      }
      state.isRunning = true
      break
    }
    case "pause": {
      if (config.timerType === "duration" && state.isRunning && state.endAt) {
        state.remainingMs = Math.max(0, state.endAt - Date.now())
        state.endAt = null
      }
      state.isRunning = false
      break
    }
    case "resume": {
      if (config.timerType === "duration" && state.remainingMs > 0) {
        state.endAt = Date.now() + state.remainingMs
      }
      state.isRunning = true
      break
    }
    case "reset": {
      state.endAt = null
      state.remainingMs = 0
      state.isRunning = false
      break
    }
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  await setTimerState(state)
  broadcast("timer:state", state)
  return NextResponse.json(state)
}
