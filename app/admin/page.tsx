import { isAuthenticated } from "@/lib/auth"
import { getConfig } from "@/lib/config"
import { getTimerState } from "@/lib/timer"
import { LoginForm } from "@/components/admin/login-form"
import { ConfigForm } from "@/components/admin/config-form"

export const metadata = {
  title: "Quản trị",
}

export default async function AdminPage() {
  const authed = await isAuthenticated()

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-4">
        <LoginForm />
      </div>
    )
  }

  const [config, timerState] = await Promise.all([
    getConfig(),
    getTimerState(),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <ConfigForm config={config} timerState={timerState} />
      </div>
    </div>
  )
}
