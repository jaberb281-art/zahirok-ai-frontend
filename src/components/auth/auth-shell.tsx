import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"

type AuthShellProps = {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-charcoal px-5 py-5 text-sand sm:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(227,122,44,0.22),transparent_30%),radial-gradient(circle_at_16%_24%,rgba(183,62,31,0.2),transparent_27%),radial-gradient(circle_at_84%_18%,rgba(26,58,92,0.8),transparent_35%),linear-gradient(135deg,var(--charcoal)_0%,var(--deep-indigo)_44%,var(--charcoal)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,rgba(237,227,211,0.45)_1px,transparent_1px),linear-gradient(rgba(237,227,211,0.35)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-charcoal/85 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-charcoal to-transparent" />

      <section className="relative z-10 mx-auto flex w-full max-w-md flex-col justify-center py-3">
        <div className="w-full">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-sand/15 bg-sand/8 px-4 py-2 text-sm font-bold text-sand/80 transition hover:bg-sand/12 hover:text-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>

          <div className="mt-7 flex items-center justify-center">
            <BrandLogo className="h-10 w-auto" />
          </div>

          <div className="mt-5">{children}</div>
        </div>
      </section>
    </div>
  )
}
