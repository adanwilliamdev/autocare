"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { LoginCredentials } from "@/types/auth"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data as LoginCredentials)
      toast.success("Login realizado com sucesso!")
      router.push("/")
    } catch (error) {
      toast.error("Email ou senha inválidos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-paper">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[42%] relative bg-graphite-900 text-white flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative px-12 pt-14">
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-400">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-lg font-display font-semibold tracking-tight">AutoCare</span>
          </div>
        </div>
        <div className="relative px-12 pb-16">
          <p className="font-display text-3xl leading-snug max-w-sm text-white">
            Cada ordem de serviço, cada peça, cada cliente — em um só lugar.
          </p>
          <p className="mt-4 text-sm text-graphite-400 max-w-sm">
            Sistema de gestão para oficinas que levam a operação a sério.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-sm w-full">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-amber-500">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M12 7v5l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-lg font-display font-semibold text-graphite-900">AutoCare</span>
          </div>

          <h2 className="text-2xl font-display font-semibold text-graphite-900">Entrar</h2>
          <p className="mt-1.5 text-sm text-graphite-500">Acesse o painel de gestão da sua oficina.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="voce@oficina.com"
                className="input-field"
              />
              {errors.email && (
                <p className="text-rust-500 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">Senha</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="input-field"
              />
              {errors.password && (
                <p className="text-rust-500 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
