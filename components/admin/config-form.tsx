"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useSSE } from "@/hooks/use-sse"
import type { CountdownConfig } from "@/types/config"
import type { TimerState } from "@/lib/timer-types"

interface ConfigFormProps {
  config: CountdownConfig
  timerState: TimerState
}

function Toast({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error"
  message: string
  onDismiss: () => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${
          type === "success"
            ? "border-emerald-700/40 bg-emerald-950/80 text-emerald-300"
            : "border-red-700/40 bg-red-950/80 text-red-300"
        }`}
      >
        {type === "success" ? (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        )}
        {message}
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export function ConfigForm({ config: initial, timerState: initialTimer }: ConfigFormProps) {
  const [config, setConfig] = useState<CountdownConfig>(initial)
  const [timerState, setTimerState] = useState<TimerState>(initialTimer)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [lastSaved, setLastSaved] = useState(initial)

  const router = useRouter()

  useSSE("/api/admin/events", {
    "timer:state": useCallback((data: unknown) => {
      setTimerState(data as TimerState)
    }, []),
  })

  const [date, time] = config.eventDate.includes("T")
    ? config.eventDate.split("T")
    : [config.eventDate, "00:00"]
  const localDatetime = `${date}T${time.slice(0, 5)}`

  function update<K extends keyof CountdownConfig>(key: K, value: CountdownConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const timerAction = useCallback(async (action: string) => {
    const res = await fetch("/api/admin/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) {
      const data = await res.json()
      setToast({ type: "error", message: data.error || "Thất bại" })
    }
  }, [])

  async function saveAndRun() {
    setSaving(true)
    setToast(null)

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!res.ok) {
        const data = await res.json()
        setToast({ type: "error", message: data.error || "Lưu thất bại" })
        return
      }

      if (config.timerType === "duration") {
        await timerAction("start")
      }

      setToast({ type: "success", message: "Đã lưu và chạy!" })
      setLastSaved(config)
    } catch {
      setToast({ type: "error", message: "Có lỗi xảy ra" })
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.refresh()
  }

  const isIdle = !timerState.isRunning && timerState.remainingMs === 0 && !timerState.endAt
  const isPaused = !timerState.isRunning && !isIdle
  const dirty = JSON.stringify(config) !== JSON.stringify(lastSaved)
  const canSave = dirty || isIdle

  return (
    <div className="mx-auto max-w-xl">
      {toast && <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />}

      <div className="flex items-center justify-between rounded-xl border border-blue-800/30 bg-blue-950/40 px-5 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">C</div>
          <div>
            <h1 className="text-base font-bold text-white">Countdown THPT</h1>
            <p className="text-[11px] text-blue-300">Quản trị</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" className="inline-flex h-7 items-center gap-1 rounded-md border border-blue-800/50 bg-blue-950/40 px-2.5 text-xs font-medium text-blue-300 hover:text-white hover:bg-blue-900/40 transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Xem trang
          </a>
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-blue-800/50 text-blue-300 hover:text-white hover:bg-blue-900/40 h-7 text-xs">Đăng xuất</Button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm p-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-200">Loại đồng hồ</span>
            <div className="inline-flex rounded-lg bg-blue-950/60 p-0.5 border border-blue-800/30">
              {[
                { value: "datetime" as const, label: "Đếm ngược" },
                { value: "duration" as const, label: "Tính giờ" },
              ].map(({ value: v, label }) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => update("timerType", v)}
                  className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                    config.timerType === v ? "bg-blue-600 text-white shadow-sm" : "text-blue-300 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-blue-300">Tiêu đề</Label>
            <input
              value={config.title}
              onChange={(e) => update("title", e.target.value)}
              className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-sm text-white placeholder:text-blue-400/50 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-blue-300">Lời nhắn</Label>
            <textarea
              value={config.message}
              onChange={(e) => update("message", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-sm text-white placeholder:text-blue-400/50 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors outline-none resize-none"
            />
          </div>

          {config.timerType === "datetime" ? (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-blue-300">Ngày & giờ</Label>
              <Input
                type="datetime-local"
                value={localDatetime}
                onChange={(e) => { const v = e.target.value; if (v) update("eventDate", `${v}:00+07:00`) }}
                className="border-blue-800/50 bg-blue-950/40 text-white [color-scheme:dark] h-8 text-sm"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-blue-300">Thời gian (phút)</Label>
              <Input type="number" min={1} value={config.durationMinutes} onChange={(e) => update("durationMinutes", Number(e.target.value))} className="border-blue-800/50 bg-blue-950/40 text-white h-8 text-sm max-w-[160px]" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-blue-300">Đơn vị hiển thị</p>
            <div className="flex flex-wrap gap-5">
              {([["days","Ngày"],["hours","Giờ"],["minutes","Phút"],["seconds","Giây"]] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-xs cursor-pointer text-blue-200 hover:text-white transition-colors">
                  <Checkbox
                    checked={config.enabledUnits[key]}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enabledUnits: { ...prev.enabledUnits, [key]: checked === true } }))}
                    className="border-blue-600 data-[state=checked]:bg-blue-600 h-3.5 w-3.5"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={saveAndRun}
          disabled={saving || !canSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {saving ? (
            <><svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang xử lý...</>
          ) : (
            <>▶ Lưu & Chạy</>
          )}
        </button>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-blue-400">
            <span>Trạng thái:</span>
            {timerState.isRunning ? (
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Đang chạy
              </span>
            ) : isPaused ? (
              <span className="text-amber-400">Đã tạm dừng</span>
            ) : (
              <span className="text-blue-400">Chưa bắt đầu</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {timerState.isRunning ? (
              <Button size="sm" onClick={() => timerAction("pause")} className="bg-amber-600 hover:bg-amber-500 text-white h-8 text-xs px-3">
                ⏸ Tạm dừng
              </Button>
            ) : isPaused ? (
              <Button size="sm" onClick={() => timerAction("resume")} className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs px-3">
                ▶ Tiếp tục
              </Button>
            ) : null}
            {!isIdle && (
              <Button size="sm" onClick={() => timerAction("reset")} variant="outline" className="border-red-800/40 text-red-400 hover:text-red-300 h-8 text-xs px-3">
                ✕ Đặt lại
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
