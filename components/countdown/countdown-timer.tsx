"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
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

function DateTimeCountdown({
  config,
  timerState,
}: {
  config: CountdownConfig
  timerState: TimerState
}) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(
    config.eventDate
  )

  const totalSec = days * 86400 + hours * 3600 + minutes * 60 + seconds
  const units = getDisplayUnits(totalSec, config.enabledUnits)

  const isIdle = !timerState.isRunning && timerState.remainingMs === 0 && !timerState.endAt

  if (isIdle) {
    return (
      <div className="text-center">
        <p className="text-2xl sm:text-3xl text-blue-300">
          Đồng hồ chưa bắt đầu
        </p>
      </div>
    )
  }

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

const BOTTOM_LOGOS = [
  { src: "/logos/AI_Robotic-01.png", alt: "AI & Robotic" },
  { src: "/logos/Khoa_CNTT-02.png", alt: "Khoa CNTT" },
  { src: "/logos/Lab_T&A-04.png", alt: "Lab T&A" },
  { src: "/logos/Media_T&A-05.png", alt: "Media T&A" },
]

export function CountdownTimer({ config, timerState }: CountdownTimerProps) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <GlowOrbs accentColor={config.accentColor} />

      <div className="relative z-10 flex justify-center pt-8 sm:pt-12">
        <div className="relative w-[260px] h-[117px] sm:w-[480px] sm:h-[216px]">
          <Image
            src="/logos/LHU&ASU-03.png"
            alt="LHU & ASU"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 300px, 540px"
            preload
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-10 px-4">
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
          <DateTimeCountdown config={config} timerState={timerState} />
        )}
      </div>

      <div className="relative z-10 flex justify-center pb-8 sm:pb-12 mt-12 sm:mt-20">
        <div className="bg-white rounded-xl flex flex-wrap justify-center gap-6 sm:gap-12 py-4 sm:py-6 px-6 sm:px-10 shadow-lg">
          {BOTTOM_LOGOS.map((logo) => (
            <div key={logo.src} className="relative w-[90px] h-[68px] sm:w-[140px] sm:h-[105px]">
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 120px, 200px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
