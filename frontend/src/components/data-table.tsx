"use client"

import type { ReactNode } from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

export interface RowAction<T> {
  label: string
  onSelect: (row: T) => void
  destructive?: boolean
  /** Devolva true para esconder a ação nesta linha. */
  hidden?: (row: T) => boolean
}

interface DataTableProps<T> {
  data: T[] | undefined
  columns: Column<T>[]
  actions?: RowAction<T>[]
  isLoading?: boolean
  errorMessage?: string | null
  emptyMessage?: string
}

const frame = "overflow-hidden rounded-xl2 border border-graphite-100 bg-white shadow-soft"

export function DataTable<T extends { id: string }>({
  data,
  columns,
  actions,
  isLoading,
  errorMessage,
  emptyMessage = "Nenhum dado encontrado",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={`${frame} space-y-3 p-5`} aria-busy="true" aria-label="Carregando">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div role="alert" className={`${frame} py-14 text-center text-sm text-rust-500`}>
        {errorMessage}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <div className={`${frame} py-14 text-center text-sm text-graphite-400`}>{emptyMessage}</div>
  }

  return (
    <div className={frame}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead key={column.header} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            {actions && <TableHead className="w-16 text-right">Ações</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => {
            const visibleActions = actions?.filter((action) => !action.hidden?.(row)) ?? []
            return (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.header} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    {visibleActions.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal />
                            <span className="sr-only">Ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {visibleActions.map((action) => (
                            <DropdownMenuItem
                              key={action.label}
                              variant={action.destructive ? "destructive" : "default"}
                              onSelect={() => action.onSelect(row)}
                            >
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
