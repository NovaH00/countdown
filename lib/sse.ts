type Client = {
  controller: ReadableStreamDefaultController
}

const clients = new Map<string, Client>()

export function addClient(id: string, controller: ReadableStreamDefaultController) {
  clients.set(id, { controller })
}

export function removeClient(id: string) {
  clients.delete(id)
}

export function broadcast(event: string, data: unknown) {
  const encoder = new TextEncoder()
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const [id, client] of clients) {
    try {
      client.controller.enqueue(encoder.encode(message))
    } catch {
      clients.delete(id)
    }
  }
}
