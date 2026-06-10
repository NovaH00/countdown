import { promises as fs } from "fs"
import path from "path"
import type { CountdownConfig } from "@/types/config"

const configPath = path.join(process.cwd(), "data", "config.json")

let cachedConfig: CountdownConfig | null = null

export async function getConfig(): Promise<CountdownConfig> {
  if (cachedConfig) return cachedConfig

  const raw = await fs.readFile(configPath, "utf-8")
  cachedConfig = JSON.parse(raw)
  return cachedConfig!
}

export async function updateConfig(data: CountdownConfig): Promise<CountdownConfig> {
  const raw = JSON.stringify(data, null, 2)
  await fs.writeFile(configPath, raw, "utf-8")
  cachedConfig = data
  return data
}
