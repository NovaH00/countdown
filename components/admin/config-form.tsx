"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useSSE } from "@/hooks/use-sse"
import type { CountdownConfig, TimelineEvent } from "@/types/config"
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

function parseDate(iso: string) {
  const [date, timePart] = iso.includes("T") ? iso.split("T") : [iso, "00:00"]
  const [y, m, d] = date.split("-")
  return {
    dd: d ?? "",
    mm: m ?? "",
    yyyy: y ?? "",
    hh: (timePart || "00:00").slice(0, 2),
    min: (timePart || "00:00").slice(3, 5),
  }
}

function TimelineDateInput({
  value,
  onChange,
}: {
  value: string
  onChange: (iso: string) => void
}) {
  const [localState, setLocalState] = useState(() => parseDate(value))
  const [prevValue, setPrevValue] = useState(value)

  if (value !== prevValue) {
    const next = parseDate(value)
    setLocalState((prev) => {
      const isEq =
        parseInt(next.dd || "0") === parseInt(prev.dd || "0") &&
        parseInt(next.mm || "0") === parseInt(prev.mm || "0") &&
        parseInt(next.yyyy || "0") === parseInt(prev.yyyy || "0") &&
        parseInt(next.hh || "0") === parseInt(prev.hh || "0") &&
        parseInt(next.min || "0") === parseInt(prev.min || "0")
      return isEq ? prev : next
    })
    setPrevValue(value)
  }

  const { dd, mm, yyyy, hh, min } = localState

  function commit(fields: { dd?: string; mm?: string; yyyy?: string; hh?: string; min?: string }) {
    const s = { ...localState, ...fields }
    setLocalState(s)
    const iso = `${s.yyyy}-${s.mm.padStart(2, "0")}-${s.dd.padStart(2, "0")}T${s.hh.padStart(2, "0")}:${s.min.padStart(2, "0")}:00+07:00`
    onChange(iso)
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="text" inputMode="numeric"
        value={dd}
        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); commit({ dd: v }) }}
        className="border-blue-800/50 bg-blue-950/40 text-white h-7 text-xs w-10 text-center"
      />
      <span className="text-blue-300 text-xs">/</span>
      <Input
        type="text" inputMode="numeric"
        value={mm}
        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); commit({ mm: v }) }}
        className="border-blue-800/50 bg-blue-950/40 text-white h-7 text-xs w-10 text-center"
      />
      <span className="text-blue-300 text-xs">/</span>
      <Input
        type="text" inputMode="numeric"
        value={yyyy}
        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); commit({ yyyy: v }) }}
        className="border-blue-800/50 bg-blue-950/40 text-white h-7 text-xs w-16 text-center"
      />
      <Input
        type="text" inputMode="numeric"
        value={hh}
        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); commit({ hh: v }) }}
        className="border-blue-800/50 bg-blue-950/40 text-white h-7 text-xs w-10 text-center"
      />
      <span className="text-blue-300 text-xs">:</span>
      <Input
        type="text" inputMode="numeric"
        value={min}
        onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); commit({ min: v }) }}
        className="border-blue-800/50 bg-blue-950/40 text-white h-7 text-xs w-10 text-center"
      />
    </div>
  )
}

function defaultEndTime() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  const h = String(now.getHours() + 1).padStart(2, "0")
  return `${y}-${m}-${d}T${h}:00:00+07:00`
}

export function ConfigForm({ config: initial, timerState: initialTimer }: ConfigFormProps) {
  const [config, setConfig] = useState<CountdownConfig>(initial)
  const [timerState, setTimerState] = useState<TimerState>(initialTimer)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [dirty, setDirty] = useState(false)
  const [now, setNow] = useState<number>(0)
  const [mounted, setMounted] = useState(false)
  const [canSave, setCanSave] = useState(false)

  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setCanSave(!saving && dirty)
  }, [saving, dirty])

  const isSaveDisabled = !canSave

  useSSE("/api/admin/events", {
    "timer:state": (data: unknown) => {
      setTimerState(data as TimerState)
    },
    "config:updated": (data: unknown) => {
      setConfig(data as CountdownConfig)
      setDirty(false)
    },
  })

  function update<K extends keyof CountdownConfig>(key: K, value: CountdownConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }

  function updateTimeline(index: number, field: keyof TimelineEvent, value: string) {
    setConfig((prev) => {
      const timeline = [...prev.timeline]
      timeline[index] = { ...timeline[index], [field]: value }
      return { ...prev, timeline }
    })
    setDirty(true)
  }

  function addItem() {
    setConfig((prev) => ({
      ...prev,
      timeline: [...prev.timeline, { name: "", endTime: defaultEndTime() }],
    }))
    setDirty(true)
  }

  function removeItem(index: number) {
    setConfig((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index),
    }))
    setDirty(true)
  }

  const timerAction = useCallback(async (action: string, index?: number) => {
    setTimerState((prev) => {
      switch (action) {
        case "start":
        case "resume":
          return { ...prev, isRunning: true, endAt: prev.endAt ?? Date.now() }
        case "pause":
          return { ...prev, isRunning: false }
        case "reset":
          return { isRunning: false, endAt: null, forcedEventIndex: null }
        case "setEvent":
          return { ...prev, forcedEventIndex: index ?? null }
        default:
          return prev
      }
    })

    const res = await fetch("/api/admin/timer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, index }),
    })
    if (!res.ok) {
      const data = await res.json()
      setToast({ type: "error", message: data.error || "Thất bại" })
    }
  }, [])

  async function save() {
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

      setToast({ type: "success", message: "Đã lưu!" })
      setDirty(false)
    } catch {
      setToast({ type: "error", message: "Có lỗi xảy ra" })
    } finally {
      setSaving(false)
    }
  }

  async function run() {
    setToast(null)
    await timerAction("start")
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.refresh()
  }

  const isIdle = !timerState.isRunning && timerState.endAt === null
  const isPaused = !timerState.isRunning && timerState.endAt !== null

  const currentEventIndex = useMemo(() => {
    if (!mounted || now === 0) return -1
    if (typeof timerState.forcedEventIndex === "number") {
      return timerState.forcedEventIndex
    }
    for (let i = 0; i < config.timeline.length; i++) {
      if (new Date(config.timeline[i].endTime).getTime() > now) return i
    }
    return -1
  }, [mounted, timerState.forcedEventIndex, config.timeline, now])

  return (
    <div className="mx-auto max-w-6xl px-4">
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

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm p-5 space-y-5">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-blue-300">Tiêu đề</Label>
              <input
                value={config.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full rounded-lg border border-blue-800/50 bg-blue-950/40 px-3 py-2.5 text-sm text-white placeholder:text-blue-400/50 focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-blue-300">Đơn vị hiển thị</p>
              <div className="flex flex-wrap gap-5">
                {([["days","Ngày"],["hours","Giờ"],["minutes","Phút"],["seconds","Giây"]] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-xs cursor-pointer text-blue-200 hover:text-white transition-colors">
                    <Checkbox
                      checked={config.enabledUnits[key]}
                      onCheckedChange={(checked) => { setConfig((prev) => ({ ...prev, enabledUnits: { ...prev.enabledUnits, [key]: checked === true } })); setDirty(true) }}
                      className="border-blue-600 data-[state=checked]:bg-blue-600 h-3.5 w-3.5"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={save}
            disabled={isSaveDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <><svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Đang lưu...</>
            ) : (
              <>💾 Lưu</>
            )}
          </button>

          <div className="rounded-xl border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-blue-200">Điều khiển</h2>

            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-400">Trạng thái:</span>
              {timerState.isRunning ? (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Đang chạy
                </span>
              ) : isPaused ? (
                <span className="text-xs text-amber-400">Đã tạm dừng</span>
              ) : (
                <span className="text-xs text-blue-400">Chưa bắt đầu</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isIdle && (
                <Button onClick={run} className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-sm px-4">
                  ▶ Chạy
                </Button>
              )}
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

          {config.timeline.length > 0 && (
            <div className="rounded-xl border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-blue-200">Chọn sự kiện</h2>
                {(timerState.forcedEventIndex != null) && (
                  <Button
                    size="sm"
                    onClick={() => timerAction("setEvent")}
                    className="bg-blue-600 hover:bg-blue-500 text-white h-7 text-xs px-3"
                  >
                    Auto
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => timerAction("setEvent")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    timerState.forcedEventIndex == null
                      ? "border-yellow-500/60 bg-yellow-950/30 text-yellow-200 ring-1 ring-yellow-500/30"
                      : "border-blue-800/30 bg-blue-950/30 text-blue-300 hover:border-blue-600/50"
                  }`}
                >
                  Tự động
                </button>
                {config.timeline.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => timerAction("setEvent", i)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      timerState.forcedEventIndex === i
                        ? "border-yellow-500/60 bg-yellow-950/30 text-yellow-200 ring-1 ring-yellow-500/30"
                        : "border-blue-800/30 bg-blue-950/30 text-blue-300 hover:border-blue-600/50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-4 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-3">
            <div className="rounded-xl border border-blue-800/30 bg-blue-950/40 backdrop-blur-sm p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-blue-200">Dòng thời gian</h2>
                <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white h-7 text-xs px-3">
                  + Thêm sự kiện
                </Button>
              </div>

              {config.timeline.length === 0 && (
                <p className="text-xs text-blue-400">Chưa có sự kiện nào. Nhấn &quot;Thêm sự kiện&quot; để bắt đầu.</p>
              )}

              {config.timeline.map((item, i) => {
                const isCurrent = i === currentEventIndex
                const isPast = currentEventIndex === -1 ? true : i < currentEventIndex
                return (
                <div key={i} className={`rounded-lg border p-3 space-y-2 transition-all ${
                  isCurrent
                    ? "border-yellow-500/60 bg-yellow-950/30 ring-1 ring-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                    : isPast
                      ? "border-blue-800/10 bg-blue-950/10 opacity-60"
                      : "border-blue-800/20 bg-blue-950/30"
                }`}>
                  <div className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                      isCurrent
                        ? "bg-yellow-500 text-yellow-950 shadow-[0_0_0_4px_rgba(234,179,8,0.3)]"
                        : isPast
                          ? "bg-blue-900/40 text-blue-400"
                          : "bg-blue-600/50 text-blue-200"
                    }`}>
                      {i + 1}
                    </span>
                    <input
                      value={item.name}
                      onChange={(e) => updateTimeline(i, "name", e.target.value)}
                      placeholder="Tên sự kiện"
                      className={`flex-1 rounded border px-2 py-1 text-sm placeholder:text-blue-400/50 focus-visible:ring-1 focus-visible:ring-blue-500 transition-colors outline-none ${
                        isCurrent
                          ? "border-yellow-600/50 bg-yellow-950/40 text-yellow-100 focus-visible:border-yellow-500"
                          : "border-blue-800/40 bg-blue-950/40 text-white focus-visible:border-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-xs text-red-400 hover:bg-red-950/50 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <TimelineDateInput
                    value={item.endTime}
                    onChange={(v) => updateTimeline(i, "endTime", v)}
                  />
                </div>
              )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
