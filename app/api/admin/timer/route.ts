import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
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

  const body = await request.json()
  const { action } = body
  const state = await getTimerState()

  switch (action) {
    case "start":
    case "resume":
      state.isRunning = true
      if (state.endAt === null) state.endAt = Date.now()
      break
    case "pause":
      state.isRunning = false
      break
    case "reset":
      state.isRunning = false
      state.endAt = null
      state.forcedEventIndex = null
      break
    case "setEvent":
      state.forcedEventIndex = body.index ?? null
      break
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  await setTimerState(state)
  broadcast("timer:state", state)
  return NextResponse.json(state)
}
