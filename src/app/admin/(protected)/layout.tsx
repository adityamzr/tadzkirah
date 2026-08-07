import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import { getAllContent } from "@/lib/content"
import { isDatabaseConfigured } from "@/lib/db"
import AdminSidebar from "@/components/admin/AdminSidebar"

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) {
    redirect("/admin/login")
  }

  const allContent = await getAllContent()

  const stats = {
    total: allContent.length,
    quran: allContent.filter(c => c.type === 'quran').length,
    hadith: allContent.filter(c => c.type === 'hadith').length,
    dua: allContent.filter(c => c.type === 'dua').length,
    reminder: allContent.filter(c => c.type === 'reminder').length,
    reflection: allContent.filter(c => c.type === 'reflection').length,
    dbConfigured: isDatabaseConfigured(),
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB] dark:bg-[#0D1117] antialiased">
      <AdminSidebar stats={stats} />
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB] dark:bg-[#0D1117]">
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
