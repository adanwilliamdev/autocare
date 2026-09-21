"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Qualquer rota desconhecida volta para a home (o AppShell então leva cada papel à sua página).
export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return null
}
