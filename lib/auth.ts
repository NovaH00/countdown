import { cookies } from "next/headers"
import { createHash, createHmac, timingSafeEqual } from "crypto"

const SESSION_COOKIE = "admin_session"

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set")
  return secret
}

export function signSession(value: string): string {
  const secret = getSecret()
  const hmac = createHmac("sha256", secret).update(value).digest("hex")
  return `${value}.${hmac}`
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(".")
  if (parts.length !== 2) return null

  const [value, sig] = parts
  const secret = getSecret()
  const expectedSig = createHmac("sha256", secret).update(value).digest("hex")

  try {
    if (timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return value
    }
  } catch {
    return null
  }
  return null
}

export function validateCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME
  const expectedPass = process.env.ADMIN_PASSWORD

  if (!expectedUser || !expectedPass) return false

  const userHash = createHash("sha256").update(username).digest()
  const passHash = createHash("sha256").update(password).digest()
  const expUserHash = createHash("sha256").update(expectedUser).digest()
  const expPassHash = createHash("sha256").update(expectedPass).digest()

  try {
    return (
      timingSafeEqual(userHash, expUserHash) &&
      timingSafeEqual(passHash, expPassHash)
    )
  } catch {
    return false
  }
}

export async function setSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  const token = signSession("authenticated")

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  if (!session) return false

  return verifySessionToken(session.value) !== null
}
