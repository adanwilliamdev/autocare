"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import AuthGuard from "@/lib/AuthGuard"
import Layout from "@/components/common/Layout/Layout"
import DataTable from "@/components/common/Table/DataTable"
import { getMechanics, deleteMechanic, setMechanicAvailability } from "@/api/mechanics"
import { Mechanic } from "@/types/mechanic"
import MechanicForm from "@/components/mechanics/MechanicForm"

function MechanicsPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const queryClient = useQueryClient()

  const { data: mechanics, isLoading } = useQuery({
    queryKey: ["mechanics"],
    queryFn: getMechanics,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      toast.success("Mecânico removido com sucesso")
    },
    onError: () => {
      toast.error("Erro ao remover mecânico")
    },
  })

  const availabilityMutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      setMechanicAvailability(id, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mechanics"] })
      toast.success("Disponibilidade atualizada")
    },
    onError: () => {
      toast.error("Erro ao atualizar disponibilidade")
    },
  })

  const columns = [
    { key: "name", label: "Nome" },
    { key: "specialty", label: "Especialidade" },
    { key: "phone", label: "Telefone" },
    {
      key: "isAvailable",
      label: "Disponibilidade",
      render: (value: boolean) => (
        <span className={`badge ${value ? "bg-moss-50 text-moss-700" : "bg-amber-100 text-amber-700"}`}>
          <span className={`badge-dot ${value ? "bg-moss-500" : "bg-amber-500"}`} />
          {value ? "Disponível" : "Ocupado"}
        </span>
      ),
    },
  ]

  const actions = [
    {
      label: "Editar",
      onClick: (mechanic: Mechanic) => {
        setSelectedMechanic(mechanic)
        setIsModalOpen(true)
      },
    },
    {
      label: "Alternar disponibilidade",
      onClick: (mechanic: Mechanic) => {
        availabilityMutation.mutate({ id: mechanic.id, available: !mechanic.isAvailable })
      },
    },
    {
      label: "Excluir",
      onClick: (mechanic: Mechanic) => {
        if (window.confirm(`Tem certeza que deseja excluir ${mechanic.name}?`)) {
          deleteMutation.mutate(mechanic.id)
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
            <h1 className="text-2xl font-display font-semibold text-graphite-900">Mecânicos</h1>
            <p className="text-graphite-500">Gerencie a equipe de mecânicos da oficina</p>
          </div>
          <button
            onClick={() => {
              setSelectedMechanic(null)
              setIsModalOpen(true)
            }}
            className="btn-primary"
          >
            + Novo Mecânico
          </button>
        </div>

        <DataTable
          data={mechanics || []}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
        />

        <MechanicForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedMechanic(null)
          }}
          mechanic={selectedMechanic}
        />
      </div>
    </Layout>
  )
}

// Equipe de mecânicos: gestão por ADMIN/MANAGER; RECEPTIONIST só consulta para
// atribuir OS (mesma regra do MechanicController do backend).
export default function MechanicsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "MANAGER", "RECEPTIONIST"]}>
      <MechanicsPageContent />
    </AuthGuard>
  )
}
