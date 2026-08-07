import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Allow login page without auth check - it will be handled via path check in middleware alternative
  // But here we check - if on login page, don't redirect? We need to know path.
  // Since layout applies to all /admin routes, we need to allow /admin/login
  // We'll handle auth in page components instead, but also check cookie here for simplicity
  // Actually we will let login page handle its own redirect, so we just render children
  // To prevent infinite loop, we check if already authenticated for login page, we redirect handled in login page
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0D1117]">
      {children}
    </div>
  )
}
