"use client"

import { useEffect, useRef } from "react"

type EventHandler = (data: unknown) => void

export function useSSE(url: string, handlers: Record<string, EventHandler>) {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const es = new EventSource(url)

    es.addEventListener("connected", () => {})

    for (const event of Object.keys(handlers)) {
      es.addEventListener(event, (e: MessageEvent) => {
        try {
          handlersRef.current[event]?.(JSON.parse(e.data))
        } catch {
          // ignore parse errors
        }
      })
    }

    return () => es.close()
  }, [url, handlers])
}
