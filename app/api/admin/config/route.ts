import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getConfig, updateConfig } from "@/lib/config"
import { broadcast } from "@/lib/sse"
import type { CountdownConfig } from "@/types/config"

export async function GET() {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const config = await getConfig()
  return NextResponse.json(config)
}

export async function PUT(request: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body: CountdownConfig = await request.json()

  if (!body.title) {
    return NextResponse.json({ error: "Thiếu tiêu đề" }, { status: 400 })
  }

  if (body.timerType === "datetime" && !body.eventDate) {
    return NextResponse.json({ error: "Thiếu thời gian" }, { status: 400 })
  }

  if (!Array.isArray(body.subjects)) {
    return NextResponse.json({ error: "Danh sách môn thi không hợp lệ" }, { status: 400 })
  }

  const updated = await updateConfig(body)
  broadcast("config:updated", updated)
  return NextResponse.json(updated)
}
