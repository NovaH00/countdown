"use client"

import { useState, useEffect } from "react"
import { CountdownTimer } from "./countdown-timer"
import { RedirectPage } from "./redirect-page"
import { useSSE } from "@/hooks/use-sse"
import type { CountdownConfig } from "@/types/config"
import type { TimerState } from "@/lib/timer-types"

export function CountdownPage({
  config: initialConfig,
  timerState: initialTimer,
}: {
  config: CountdownConfig
  timerState: TimerState
}) {
  const [config, setConfig] = useState(initialConfig)
  const [timerState, setTimerState] = useState<TimerState>(initialTimer)

  useEffect(() => {
    fetch("/api/timer")
      .then((r) => r.json())
      .then((data) => {
        setTimerState(data.timer)
        setConfig(data.config)
      })
      .catch(() => {})
  }, [])

  useSSE("/api/events", {
    "timer:state": (data) => {
      setTimerState(data as TimerState)
    },
    "config:updated": (data) => {
      setConfig(data as CountdownConfig)
    },
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: config.bgColor }}>
      {config.activeScreen === "redirects" ? (
        <RedirectPage config={config} />
      ) : (
        <CountdownTimer config={config} timerState={timerState} />
      )}
    </div>
  )
}
