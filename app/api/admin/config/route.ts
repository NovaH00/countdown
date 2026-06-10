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

  if (!body.timeline || body.timeline.length === 0) {
    return NextResponse.json({ error: "Thiếu danh sách sự kiện" }, { status: 400 })
  }

  for (let i = 0; i < body.timeline.length; i++) {
    const item = body.timeline[i]
    if (!item.name) {
      return NextResponse.json({ error: `Sự kiện ${i + 1} thiếu tên` }, { status: 400 })
    }
    if (!item.endTime) {
      return NextResponse.json({ error: `Sự kiện ${i + 1} thiếu thời gian` }, { status: 400 })
    }
    if (isNaN(new Date(item.endTime).getTime())) {
      return NextResponse.json({ error: `Sự kiện ${i + 1} thời gian không hợp lệ` }, { status: 400 })
    }
  }

  const updated = await updateConfig(body)
  broadcast("config:updated", updated)
  return NextResponse.json(updated)
}
