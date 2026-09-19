"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "@/contexts/AuthContext"

export default function Providers({ children }: { children: ReactNode }) {
  // useState garante uma única instância por sessão do navegador (evita recriar o
  // QueryClient a cada render, igual ao `new QueryClient()` fora do componente no
  // App.tsx original, mas seguro para o modelo de renderização do Next).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
