import { NextRequest, NextResponse } from "next/server"
import { verifyPassword, createAuthToken, getAdminCookieName } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: "Password wajib diisi" }, { status: 400 })
    }

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 })
    }

    const token = await createAuthToken(password)

    const response = NextResponse.json({ success: true, message: "Login berhasil" })

    response.cookies.set(getAdminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    })

    return response
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal login" }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logout berhasil" })
  response.cookies.delete(getAdminCookieName())
  return response
}

export async function GET() {
  // Check auth status
  const { isAdminAuthenticated } = await import("@/lib/admin-auth")
  const authenticated = await isAdminAuthenticated()
  return NextResponse.json({ authenticated })
}
