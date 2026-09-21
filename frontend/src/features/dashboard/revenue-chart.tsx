"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { formatCurrency } from "@/lib/format"

export function RevenueChart({ data }: { data: Array<{ month: string; amount: number }> }) {
  if (data.length === 0) {
    return <div className="flex h-56 items-center justify-center text-sm text-graphite-400">Sem dados disponíveis</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7ea" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#87919c", fontSize: 12 }} />
        <YAxis
          tickFormatter={(value: number) => `R$ ${(value / 1000).toLocaleString("pt-BR")} mil`}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#87919c", fontSize: 12 }}
          width={80}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(Number(value)), "Faturamento"]}
          contentStyle={{ borderRadius: 10, border: "1px solid #e5e7ea", fontSize: 13 }}
          cursor={{ fill: "#f4d497", opacity: 0.15 }}
        />
        <Bar dataKey="amount" fill="#d38623" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
