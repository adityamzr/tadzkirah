import { NextRequest, NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getContentById } from "@/lib/content"
import { updateContent, deleteContent } from "@/lib/admin-content"

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const entry = await getContentById(decodeURIComponent(id))

    if (!entry) {
      return NextResponse.json({ error: "Konten tidak ditemukan" }, { status: 404 })
    }

    return NextResponse.json({ data: entry })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal ambil konten" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const result = await updateContent(decodeURIComponent(id), body)

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Gagal update" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Konten berhasil diupdate", data: result })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal update" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Props) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const result = await deleteContent(decodeURIComponent(id))

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Gagal hapus" }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: "Konten berhasil dihapus" })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Gagal hapus" }, { status: 500 })
  }
}
