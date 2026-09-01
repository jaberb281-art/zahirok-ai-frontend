"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { EarlyAccessModal } from "@/components/early-access/early-access-modal"
import { isLaunchModeEnabled } from "@/lib/launch-mode"

interface EarlyAccessContextValue {
  openEarlyAccess: () => void
  closeEarlyAccess: () => void
  isOpen: boolean
}

const EarlyAccessContext = createContext<EarlyAccessContextValue | null>(null)

function EarlyAccessProviderInner({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const launchMode = isLaunchModeEnabled()

  const openEarlyAccess = useCallback(() => {
    if (!launchMode) return
    setIsOpen(true)
  }, [launchMode])

  const closeEarlyAccess = useCallback(() => {
    setIsOpen(false)
  }, [])

  useEffect(() => {
    if (!launchMode) return
    if (searchParams.get("earlyAccess") === "1") {
      setIsOpen(true)
      router.replace("/", { scroll: false })
    }
  }, [launchMode, router, searchParams])

  const value = useMemo(
    () => ({ openEarlyAccess, closeEarlyAccess, isOpen }),
    [closeEarlyAccess, isOpen, openEarlyAccess],
  )

  return (
    <EarlyAccessContext.Provider value={value}>
      {children}
      {launchMode ? (
        <EarlyAccessModal open={isOpen} onClose={closeEarlyAccess} />
      ) : null}
    </EarlyAccessContext.Provider>
  )
}

export function EarlyAccessProvider({ children }: { children: ReactNode }) {
  return <EarlyAccessProviderInner>{children}</EarlyAccessProviderInner>
}

export function useEarlyAccess(): EarlyAccessContextValue {
  const context = useContext(EarlyAccessContext)
  if (!context) {
    return {
      openEarlyAccess: () => {},
      closeEarlyAccess: () => {},
      isOpen: false,
    }
  }

  return context
}
