import { NextResponse } from "next/server"
import { getTimerState } from "@/lib/timer"
import { getConfig } from "@/lib/config"

export async function GET() {
  const [timer, config] = await Promise.all([getTimerState(), getConfig()])
  return NextResponse.json({ timer, config }, {
    headers: {
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
