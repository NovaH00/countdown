"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Đăng nhập thất bại")
        return
      }

      router.refresh()
    } catch {
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm border-blue-800/30 bg-blue-950/60 backdrop-blur-sm shadow-2xl">
      <CardHeader className="items-center gap-3 pb-2 pt-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">
          C
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Countdown THPT</h1>
          <p className="text-sm text-blue-300">Đăng nhập quản trị</p>
        </div>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-blue-200">
              Tên đăng nhập
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="border-blue-800/50 bg-blue-950/40 text-white placeholder:text-blue-400/50 focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-blue-200">
              Mật khẩu
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="border-blue-800/50 bg-blue-950/40 text-white placeholder:text-blue-400/50 focus:border-blue-500"
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
