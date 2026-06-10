import { NextResponse } from "next/server"
import { validateCredentials, setSessionCookie } from "@/lib/auth"

export async function POST(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (!username || !password) {
    return NextResponse.json(
      { error: "Vui lòng nhập tên đăng nhập và mật khẩu" },
      { status: 400 }
    )
  }

  if (!validateCredentials(username, password)) {
    return NextResponse.json(
      { error: "Tên đăng nhập hoặc mật khẩu không đúng" },
      { status: 401 }
    )
  }

  await setSessionCookie()

  return NextResponse.json({ success: true })
}
