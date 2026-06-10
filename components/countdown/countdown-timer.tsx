"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import { useCountdown } from "@/hooks/use-countdown"

import { TimeBlock } from "./time-block"
import type { CountdownConfig, TimelineEvent } from "@/types/config"
import type { TimerState } from "@/lib/timer-types"

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

function getCurrentEvent(timeline: TimelineEvent[], now: number, forcedIndex?: number | null): { event: TimelineEvent; index: number } | null {
  if (forcedIndex != null && forcedIndex >= 0 && forcedIndex < timeline.length) {
    return { event: timeline[forcedIndex], index: forcedIndex }
  }
  for (let i = 0; i < timeline.length; i++) {
    if (new Date(timeline[i].endTime).getTime() > now) {
      return { event: timeline[i], index: i }
    }
  }
  return null
}

function fmtEventDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const h = String(d.getHours()).padStart(2, "0")
  const m = String(d.getMinutes()).padStart(2, "0")
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return `${h}:${m}`
  }
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  return `${day}/${month} ${h}:${m}`
}

function TimelineBranch({ timeline, now, forcedIndex }: { timeline: TimelineEvent[]; now: number; forcedIndex?: number | null }) {
  const currentEvent = getCurrentEvent(timeline, now, forcedIndex)
  const currentIndex = currentEvent?.index ?? -1

  return (
    <div className="relative pl-10">
      <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-white/20 rounded-full" />

      <div className="flex flex-col gap-3">
        {timeline.map((event, i) => {
          const isPast = currentIndex === -1 ? true : i < currentIndex
          const isCurrent = i === currentIndex

          return (
            <div key={i} className="relative flex items-start gap-4">
              <div className={`relative z-10 mt-1 w-[18px] h-[18px] rounded-full shrink-0 border-[3px] ${
                isCurrent
                  ? "bg-[#ECC253] border-[#ECC253] shadow-[0_0_15px_rgba(236,194,83,0.5)]"
                  : isPast
                    ? "bg-white/20 border-white/10"
                    : "bg-transparent border-white/40"
              }`}>
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-[#ECC253] animate-pulse opacity-50" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-base sm:text-lg font-bold leading-tight ${
                  isCurrent ? "text-[#ECC253]" : isPast ? "text-white/30" : "text-white/70"
                }`}>
                  {event.name}
                </p>
                <p className={`text-sm leading-tight font-medium ${isPast ? "text-white/20" : "text-white/40"}`}>
                  {fmtEventDate(event.endTime)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CountdownDisplay({
  config,
  now,
  timerState,
}: {
  config: CountdownConfig
  now: number
  timerState: TimerState
}) {
  const isIdle = !timerState.isRunning && timerState.endAt === null

  const currentEvent = getCurrentEvent(config.timeline, now, timerState.forcedEventIndex)
  const targetDate = currentEvent ? currentEvent.event.endTime : (config.timeline[config.timeline.length - 1]?.endTime || "")
  const { days, hours, minutes, seconds } = useCountdown(targetDate)

  const totalSec = days * 86400 + hours * 3600 + minutes * 60 + seconds
  const units = getDisplayUnits(totalSec, config.enabledUnits)

  if (isIdle) {
    return (
      <div className="text-center">
        <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
          Đồng hồ chưa bắt đầu
        </p>
      </div>
    )
  }

  if (!currentEvent) {
    return (
      <p className="text-4xl sm:text-6xl font-black text-[#ECC253] text-center uppercase">
        Đã kết thúc!
      </p>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 sm:gap-12">
      {currentEvent.event.name && (
        <p className="text-3xl sm:text-5xl font-black text-[#ECC253] text-center tracking-tight uppercase">
          {currentEvent.event.name}
        </p>
      )}
      <div className="flex items-center gap-2 sm:gap-4">
        {units.map((unit) => (
          <div key={unit.label} className="flex items-center gap-2 sm:gap-4">
            <TimeBlock value={unit.value} label={unit.label} />
          </div>
        ))}
      </div>
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
  const [now, setNow] = useState<number>(0)
  const isIdle = !timerState.isRunning && timerState.endAt === null

  useEffect(() => {
    setNow(Date.now())
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: config.bgColor }}>

      <div className="relative z-10 flex justify-center pt-2 sm:pt-4">
        <div className="relative w-[200px] h-[90px] sm:w-[360px] sm:h-[162px]">
          <Image
            src="/logos/LHU&ASU-03.png?v=2"
            alt="LHU & ASU"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 300px, 540px"
            priority
          />
        </div>
      </div>

      {!isIdle && (
        <div className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-20">
          <TimelineBranch timeline={config.timeline} now={now} forcedIndex={timerState.forcedEventIndex} />
        </div>
      )}

      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-10">
          {config.title && (
            <h1 className="text-3xl sm:text-6xl font-black text-white text-center uppercase tracking-tighter">
              {config.title}
            </h1>
          )}

          <CountdownDisplay config={config} now={now} timerState={timerState} />
        </div>
      </div>

      <div className="relative z-10 flex justify-center pb-8 sm:pb-12 mt-12 sm:mt-20 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-8 py-6 sm:px-16 sm:py-8 flex flex-wrap justify-center gap-12 sm:gap-20 items-center">
          {BOTTOM_LOGOS.map((logo) => (
            <div key={logo.src} className={`relative w-[80px] h-[60px] sm:w-[120px] sm:h-[90px] ${logo.src.includes('Khoa_CNTT') ? 'scale-[1.3]' : ''}`}>
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100px, 180px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
