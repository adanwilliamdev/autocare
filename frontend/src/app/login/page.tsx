"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Login from "@/components/auth/Login"
import { useAuth } from "@/contexts/AuthContext"
import { getDefaultRouteForRole } from "@/lib/roleDefaults"

export default function LoginPage() {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(getDefaultRouteForRole(user.role))
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || (isAuthenticated && user)) {
    return null
  }

  return <Login />
}
