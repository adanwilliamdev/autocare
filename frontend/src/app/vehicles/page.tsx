"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import AuthGuard from "@/lib/AuthGuard"
import Layout from "@/components/common/Layout/Layout"
import DataTable from "@/components/common/Table/DataTable"
import { getVehicles } from "@/api/vehicles"
import VehicleForm from "@/components/vehicles/VehicleForm"
import { Vehicle } from "@/types/vehicle"

function VehiclesPageContent() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: getVehicles,
  })

  const columns = [
    { key: "plate", label: "Placa", render: (value: string) => <span className="font-mono text-graphite-800">{value}</span> },
    { key: "brand", label: "Marca" },
    { key: "model", label: "Modelo" },
    { key: "year", label: "Ano" },
    { key: "mileage", label: "Quilometragem" },
    { key: "clientName", label: "Cliente" },
    {
      key: "isActive",
      label: "Status",
      render: (value: boolean) => (
        <span className={`badge ${value ? "bg-moss-50 text-moss-700" : "bg-rust-50 text-rust-500"}`}>
          <span className={`badge-dot ${value ? "bg-moss-500" : "bg-rust-400"}`} />
          {value ? "Ativo" : "Inativo"}
        </span>
      )
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-semibold text-graphite-900">Veículos</h1>
            <p className="text-graphite-500">Gerencie os veículos da oficina</p>
          </div>
          <button
            onClick={() => {
              setSelectedVehicle(null)
              setIsModalOpen(true)
            }}
            className="btn-primary"
          >
            + Novo Veículo
          </button>
        </div>

        <DataTable
          data={vehicles || []}
          columns={columns}
          isLoading={isLoading}
          actions={[
            {
              label: "Editar",
              onClick: (vehicle) => {
                setSelectedVehicle(vehicle)
                setIsModalOpen(true)
              },
            },
          ]}
        />

        <VehicleForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedVehicle(null)
          }}
          vehicle={selectedVehicle}
        />
      </div>
    </Layout>
  )
}

// Veículos: mesmos papéis de Clientes, mais MECHANIC (precisa consultar/atualizar km).
export default function VehiclesPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN", "RECEPTIONIST", "MANAGER", "MECHANIC"]}>
      <VehiclesPageContent />
    </AuthGuard>
  )
}
