import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect } from "next/navigation"
import ContentForm from "@/components/admin/ContentForm"
import { getAllContent } from "@/lib/content"

export default async function NewContentPage() {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) redirect("/admin/login")

  const existingContents = await getAllContent()

  return <ContentForm isEdit={false} existingContents={existingContents} />
}
