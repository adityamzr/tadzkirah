import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import ContentForm from "@/components/admin/ContentForm"

export default async function NewContentPage() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) redirect("/admin/login")

  return <ContentForm isEdit={false} />
}
