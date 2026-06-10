import { isAuthenticated } from "@/lib/auth"
import { getConfig } from "@/lib/config"
import { getTimerState } from "@/lib/timer"
import { LoginForm } from "@/components/admin/login-form"
import { ConfigForm } from "@/components/admin/config-form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Quản trị",
}

export default async function AdminPage() {
  const authed = await isAuthenticated()

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#274F9D" }}>
        <LoginForm />
      </div>
    )
  }

  const [config, timerState] = await Promise.all([
    getConfig(),
    getTimerState(),
  ])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#274F9D" }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <ConfigForm config={config} timerState={timerState} />
      </div>
    </div>
  )
}
