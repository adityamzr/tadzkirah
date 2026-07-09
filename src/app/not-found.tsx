import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-muted text-lg">?</div>
      <h1 className="mt-4 text-[22px] font-semibold">Content not found</h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        This reminder may have been moved or deleted. Try searching again.
      </p>
      <Link href="/" className="mt-6 rounded-full bg-[#171717] px-5 py-2 text-[13px] text-white dark:bg-white dark:text-black">
        Back to Tadzkirah
      </Link>
    </div>
  )
}
