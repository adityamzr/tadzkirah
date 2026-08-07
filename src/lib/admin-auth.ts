import { cookies } from "next/headers"

const ADMIN_COOKIE = "tadzkirah_admin_auth"

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "tadzkirah123"
}

// Simple hash check - compare directly for simplicity, could be improved with bcrypt
export function verifyPassword(input: string): boolean {
  const expected = getAdminPassword()
  return input === expected
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return false
  // token is base64 of password hash - verify by comparing to expected password's base64
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return verifyPassword(decoded)
  } catch {
    return false
  }
}

export async function createAuthToken(password: string): Promise<string> {
  return Buffer.from(password, 'utf-8').toString('base64')
}

export function getAdminCookieName(): string {
  return ADMIN_COOKIE
}
