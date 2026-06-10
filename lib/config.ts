import { promises as fs } from "fs"
import path from "path"
import type { CountdownConfig } from "@/types/config"

const configPath = path.join(process.cwd(), "data", "config.json")

export async function getConfig(): Promise<CountdownConfig> {
  const raw = await fs.readFile(configPath, "utf-8")
  return JSON.parse(raw)
}

export async function updateConfig(data: CountdownConfig): Promise<CountdownConfig> {
  const raw = JSON.stringify(data, null, 2)
  await fs.writeFile(configPath, raw, "utf-8")
  return data
}
