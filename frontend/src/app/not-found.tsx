"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Equivalente ao <Route path="*" element={<Navigate to="/" />} /> do React Router
// original: qualquer rota desconhecida volta para a home.
export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/")
  }, [router])

  return null
}
