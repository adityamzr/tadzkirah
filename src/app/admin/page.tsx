import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { getAllContent } from "@/lib/content"
import { isDatabaseConfigured, getDatabase } from "@/lib/db"
import AdminDashboardClient from "@/components/admin/AdminDashboardClient"

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    redirect("/admin/login")
  }

  const allContent = await getAllContent()

  // Stats
  const stats = {
    total: allContent.length,
    quran: allContent.filter(c => c.type === 'quran').length,
    hadith: allContent.filter(c => c.type === 'hadith').length,
    dua: allContent.filter(c => c.type === 'dua').length,
    reminder: allContent.filter(c => c.type === 'reminder').length,
    reflection: allContent.filter(c => c.type === 'reflection').length,
    dbConfigured: isDatabaseConfigured(),
  }

  return <AdminDashboardClient initialContent={allContent} stats={stats} />
}
