import { isAdminAuthenticated } from "@/lib/admin-auth"
import { redirect, notFound } from "next/navigation"
import { getContentById } from "@/lib/content"
import ContentForm from "@/components/admin/ContentForm"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditContentPage({ params }: Props) {
  const authenticated = await isAdminAuthenticated()
  if (!authenticated) redirect("/admin/login")

  const { id } = await params
  const entry = await getContentById(decodeURIComponent(id))

  if (!entry) notFound()

  return <ContentForm initialData={entry} isEdit={true} />
}
