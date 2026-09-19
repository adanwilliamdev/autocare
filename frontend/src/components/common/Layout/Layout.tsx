"use client"

import { ReactNode } from "react"
import Header from "./Header"
import Sidebar from "./Sidebar"

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-paper">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="px-8 py-7 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  )
}
