"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: Array<{ month: string; amount: number }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-graphite-400 text-sm">
        Sem dados disponíveis
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7ea" vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#87919c', fontSize: 12 }}
        />
        <YAxis
          tickFormatter={(value) => `R$ ${value}`}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#87919c', fontSize: 12 }}
          width={70}
        />
        <Tooltip
          formatter={(value) => [`R$ ${value}`, 'Faturamento']}
          contentStyle={{ borderRadius: 10, border: '1px solid #e5e7ea', fontSize: 13 }}
          cursor={{ fill: '#f4d497', opacity: 0.15 }}
        />
        <Bar dataKey="amount" fill="#d38623" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
