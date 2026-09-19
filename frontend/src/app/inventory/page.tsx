"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import AuthGuard from "@/lib/AuthGuard"
import Layout from "@/components/common/Layout/Layout"
import DataTable from "@/components/common/Table/DataTable"
import { getParts, deletePart } from "@/api/inventory"
import { Part } from "@/types/inventory"
import PartForm from "@/components/inventory/PartForm"

function InventoryPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const queryClient = useQueryClient()

  const { data: parts, isLoading } = useQuery({
    queryKey: ["parts"],
    queryFn: getParts,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] })
      toast.success("Peça removida com sucesso")
    },
    onError: () => {
      toast.error("Erro ao remover peça")
    },
  })

  const columns = [
    { key: "code", label: "Código", render: (value: string) => <span className="font-mono text-graphite-800">{value}</span> },
    { key: "name", label: "Nome" },
    { key: "manufacturer", label: "Fabricante" },
    { key: "stockQuantity", label: "Estoque" },
    {
      key: "salePrice",
      label: "Preço de venda",
      render: (value: number) =>
        <span className="font-mono">{(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>,
    },
    {
      key: "isLowStock",
      label: "Status",
      render: (value: boolean) => (
        <span className={`badge ${value ? "bg-rust-50 text-rust-500" : "bg-moss-50 text-moss-700"}`}>
          <span className={`badge-dot ${value ? "bg-rust-400" : "bg-moss-500"}`} />
          {value ? "Estoque baixo" : "Normal"}
        </span>
      ),
    },
  ]

  const actions = [
    {
      label: "Editar",
      onClick: (part: Part) => {
        setSelectedPart(part)
        setIsModalOpen(true)
      },
    },
    {
      label: "Excluir",
      onClick: (part: Part) => {
        if (window.confirm(`Tem certeza que deseja excluir ${part.name}?`)) {
          deleteMutation.mutate(part.id)
        }
      },
      className: "text-rust-500 hover:text-rust-600",
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-semibold text-graphite-900">Estoque</h1>
            <p className="text-graphite-500">Controle de peças e movimentações</p>
          </div>
          <button
            onClick={() => {
              setSelectedPart(null)
              setIsModalOpen(true)
            }}
            className="btn-primary"
          >
            + Nova Peça
          </button>
        </div>

        <DataTable data={parts || []} columns={columns} isLoading={isLoading} actions={actions} />

        <PartForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedPart(null)
          }}
          part={selectedPart}
        />
      </div>
    </Layout>
  )
}

// Estoque: restrito a ADMIN/MANAGER (mesma regra do InventoryController do backend).
export default function InventoryPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "MANAGER"]}>
      <InventoryPageContent />
    </AuthGuard>
  )
}
