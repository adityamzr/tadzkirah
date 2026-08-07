import { NextResponse } from "next/server"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { getAllContent } from "@/lib/content"
import { isDatabaseConfigured, getDatabase } from "@/lib/db"
import { isGitHubConfigured, getGitHubStatus } from "@/lib/github"

export async function GET() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const all = await getAllContent()

    return NextResponse.json({
      total: all.length,
      byType: {
        quran: all.filter(c => c.type === 'quran').length,
        hadith: all.filter(c => c.type === 'hadith').length,
        dua: all.filter(c => c.type === 'dua').length,
        reminder: all.filter(c => c.type === 'reminder').length,
        reflection: all.filter(c => c.type === 'reflection').length,
      },
      storage: isDatabaseConfigured() ? 'neon' : 'file',
      dbConfigured: isDatabaseConfigured(),
      github: getGitHubStatus(),
      githubConfigured: isGitHubConfigured(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
