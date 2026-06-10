"use client"

import { useState, useEffect, useCallback } from "react"

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
}

export function useCountdown(targetDate: string): CountdownState {
  const calc = useCallback((): CountdownState => {
    const target = new Date(targetDate).getTime()
    const now = Date.now()
    const diff = target - now

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    return { days, hours, minutes, seconds, isExpired: false }
  }, [targetDate])

  const [state, setState] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  })

  useEffect(() => {
    setState(calc())
    const timer = setInterval(() => {
      setState(calc())
    }, 1000)

    return () => clearInterval(timer)
  }, [calc])

  return state
}
