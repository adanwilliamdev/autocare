import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Layout from '@/components/common/Layout/Layout'
import DataTable from '@/components/common/Table/DataTable'
import { getVehicles } from '@/api/vehicles'
import VehicleForm from '@/components/vehicles/VehicleForm'
import { Vehicle } from '@/types/vehicle'

export default function VehiclesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  })

  const columns = [
    { key: 'plate', label: 'Placa' },
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'year', label: 'Ano' },
    { key: 'mileage', label: 'Quilometragem' },
    { key: 'clientName', label: 'Cliente' },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Veículos</h1>
            <p className="text-gray-600">Gerencie os veículos da oficina</p>
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
              label: 'Editar',
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