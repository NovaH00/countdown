import { isAuthenticated } from "@/lib/auth"
import { addClient, removeClient } from "@/lib/sse"

export async function GET(request: Request) {
  const authed = await isAuthenticated()
  if (!authed) {
    return new Response("Unauthorized", { status: 401 })
  }

  const clientId = crypto.randomUUID()

  let heartbeatInterval: ReturnType<typeof setInterval> | null = null

  const stream = new ReadableStream({
    start(controller) {
      addClient(clientId, controller)

      const encoder = new TextEncoder()
      controller.enqueue(encoder.encode(`event: connected\ndata: {}\n\n`))

      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"))
        } catch {
          clearInterval(heartbeatInterval!)
          removeClient(clientId)
        }
      }, 30000)
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval)
      removeClient(clientId)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
