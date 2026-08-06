import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get("tadzkirah_admin_auth")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Verify token is base64 and matches ADMIN_PASSWORD
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const expected = process.env.ADMIN_PASSWORD || "tadzkirah123"
      if (decoded !== expected) {
        const response = NextResponse.redirect(new URL("/admin/login", request.url))
        response.cookies.delete("tadzkirah_admin_auth")
        return response
      }
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete("tadzkirah_admin_auth")
      return response
    }
  }

  // Also protect /api/admin except /api/admin/auth
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/auth")) {
    const token = request.cookies.get("tadzkirah_admin_auth")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - silakan login dulu" }, { status: 401 })
    }

    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8')
      const expected = process.env.ADMIN_PASSWORD || "tadzkirah123"
      if (decoded !== expected) {
        return NextResponse.json({ error: "Token tidak valid" }, { status: 401 })
      }
    } catch {
      return NextResponse.json({ error: "Token rusak" }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}
