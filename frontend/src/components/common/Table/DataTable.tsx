import { ReactNode } from 'react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (value: any, item: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  actions?: {
    label: string
    onClick: (item: T) => void
    className?: string
    show?: (item: T) => boolean
  }[]
}

export default function DataTable<T extends { id: string }>({
  data,
  columns,
  isLoading,
  actions,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 rounded-full border-2 border-graphite-200 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-14 bg-white rounded-xl2 border border-graphite-100">
        <p className="text-graphite-400 text-sm">Nenhum dado encontrado</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-xl2 border border-graphite-100 shadow-soft">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-graphite-100">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className="px-5 py-3 text-left text-xs font-medium text-graphite-400"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-5 py-3 text-left text-xs font-medium text-graphite-400">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-graphite-50">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-amber-50/40 transition-colors duration-100">
              {columns.map((column) => (
                <td key={String(column.key)} className="px-5 py-3.5 text-sm text-graphite-700 whitespace-nowrap">
                  {column.render
                    ? column.render(
                        column.key instanceof String
                          ? (item as any)[column.key as string]
                          : item[column.key as keyof T],
                        item
                      )
                    : (item as any)[column.key as string]}
                </td>
              ))}
              {actions && (
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {actions
                      .filter((action) => !action.show || action.show(item))
                      .map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.onClick(item)}
                          className={`text-sm font-medium text-graphite-500 hover:text-amber-600 transition-colors duration-100 ${action.className || ''}`}
                        >
                          {action.label}
                        </button>
                      ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
