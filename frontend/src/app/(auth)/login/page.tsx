"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/features/auth/auth-provider"
import { LoginForm } from "@/features/auth/login-form"
import { getDefaultRouteForRole } from "@/lib/navigation"

export default function LoginPage() {
  const { user, isReady } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isReady && user) router.replace(getDefaultRouteForRole(user.role))
  }, [isReady, user, router])

  if (!isReady || user) return null
  return <LoginForm />
}
