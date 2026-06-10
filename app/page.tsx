import { getConfig } from "@/lib/config"
import { getTimerState } from "@/lib/timer"
import { CountdownPage } from "@/components/countdown/countdown-page"

export const dynamic = "force-dynamic"

export default async function Home() {
  const [config, timerState] = await Promise.all([
    getConfig(),
    getTimerState(),
  ])

  return <CountdownPage config={config} timerState={timerState} />
}
