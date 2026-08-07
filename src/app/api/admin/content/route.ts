import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAllContent } from "@/lib/content"
import { createContent } from "@/lib/admin-content"

export async function GET() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const all = await getAllContent()
    return NextResponse.json({ data: all })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal ambil konten" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.id || !body.type || !body.title) {
      return NextResponse.json({ error: "ID, tipe, dan judul wajib diisi" }, { status: 400 })
    }

    const result = await createContent(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Gagal membuat konten" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Konten berhasil dibuat", data: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal membuat konten" }, { status: 500 })
  }
}
