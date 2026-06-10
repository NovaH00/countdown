"use client"

import dynamic from "next/dynamic"
import { useCountdown } from "@/hooks/use-countdown"
import { useSubjectTimer } from "@/hooks/use-subject-timer"
import { TimeBlock } from "./time-block"
import { SeparatorDot } from "./separator-dot"
import type { CountdownConfig } from "@/types/config"
import type { TimerState } from "@/lib/timer-types"

const GlowOrbs = dynamic(
  () => import("./glow-orbs").then((m) => ({ default: m.GlowOrbs })),
  { ssr: false }
)

interface CountdownTimerProps {
  config: CountdownConfig
  timerState: TimerState
}

const UNIT_DEFS = [
  { key: "days" as const, divisor: 86400, label: "Ngày" },
  { key: "hours" as const, divisor: 3600, label: "Giờ" },
  { key: "minutes" as const, divisor: 60, label: "Phút" },
  { key: "seconds" as const, divisor: 1, label: "Giây" },
]

function getDisplayUnits(totalSec: number, enabledUnits: CountdownConfig["enabledUnits"]) {
  let rem = totalSec
  const units: { value: number; label: string }[] = []
  for (const { key, divisor, label } of UNIT_DEFS) {
    if (!enabledUnits[key]) continue
    units.push({ value: Math.floor(rem / divisor), label })
    rem = rem % divisor
  }
  return units
}

function DateTimeCountdown({ config }: { config: CountdownConfig }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(
    config.eventDate
  )

  const totalSec = days * 86400 + hours * 3600 + minutes * 60 + seconds
  const units = getDisplayUnits(totalSec, config.enabledUnits)

  if (isExpired) {
    return (
      <p className="text-4xl sm:text-6xl font-bold text-amber-400 text-center">
        Đã đến giờ thi!
      </p>
    )
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
          <TimeBlock value={unit.value} label={unit.label} />
          {index < units.length - 1 && <SeparatorDot />}
        </div>
      ))}
    </div>
  )
}

function DurationCountdown({
  config,
  timerState,
}: {
  config: CountdownConfig
  timerState: TimerState
}) {
  const { minutes, seconds, isExpired } = useSubjectTimer(timerState)

  const isIdle = !timerState.isRunning && timerState.remainingMs === 0 && !timerState.endAt

  const totalSec = minutes * 60 + seconds
  const units = getDisplayUnits(totalSec, config.enabledUnits)

  if (isIdle) {
    return (
      <div className="text-center">
        <p className="text-2xl sm:text-3xl text-blue-300">
          Đồng hồ chưa bắt đầu
        </p>
        <p className="mt-2 text-lg text-blue-400/60">
          {config.durationMinutes} phút
        </p>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="text-center">
        <p className="text-5xl sm:text-7xl font-bold text-amber-400">
          Hết giờ!
        </p>
        <p className="mt-4 text-xl text-blue-200/80">
          Đã hết thời gian
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {units.map((unit, index) => (
        <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
          <TimeBlock value={unit.value} label={unit.label} />
          {index < units.length - 1 && <SeparatorDot />}
        </div>
      ))}
    </div>
  )
}

export function CountdownTimer({ config, timerState }: CountdownTimerProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <GlowOrbs accentColor={config.accentColor} />

      <div className="relative z-10 flex flex-col items-center gap-10 px-4">
        {config.title && (
          <h1 className="text-3xl sm:text-5xl font-bold text-white text-center">
            {config.title}
          </h1>
        )}

        {config.message && (
          <p className="text-base sm:text-xl text-blue-200/80 text-center max-w-xl">
            {config.message}
          </p>
        )}

        {config.timerType === "duration" ? (
          <DurationCountdown config={config} timerState={timerState} />
        ) : (
          <DateTimeCountdown config={config} />
        )}
      </div>
    </div>
  )
}
