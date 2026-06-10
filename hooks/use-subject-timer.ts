"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { calculateRemainingMs } from "@/lib/timer-types"
import type { TimerState } from "@/lib/timer-types"

interface SubjectTimerResult {
  minutes: number
  seconds: number
  isRunning: boolean
  isExpired: boolean
  refresh: () => void
}

export function useSubjectTimer(
  timerState: TimerState
): SubjectTimerResult {
  const [remainingMs, setRemainingMs] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const stateRef = useRef(timerState)
  stateRef.current = timerState

  const tick = useCallback(() => {
    setRemainingMs(calculateRemainingMs(stateRef.current))
  }, [])

  useEffect(() => {
    setHydrated(true)
    tick()
    if (!timerState.isRunning) return
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [timerState, tick])

  const remaining = Math.max(0, Math.floor(remainingMs / 1000))

  return {
    minutes: Math.floor(remaining / 60),
    seconds: remaining % 60,
    isRunning: timerState.isRunning,
    isExpired: hydrated && remaining <= 0 && (timerState.isRunning || timerState.remainingMs > 0),
    refresh: tick,
  }
}
