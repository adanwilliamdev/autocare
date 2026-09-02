import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Layout from '@/components/common/Layout/Layout'
import DataTable from '@/components/common/Table/DataTable'
import { getMechanics, deleteMechanic, setMechanicAvailability } from '@/api/mechanics'
import { Mechanic } from '@/types/mechanic'
import MechanicForm from '@/components/mechanics/MechanicForm'

export default function MechanicsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null)
  const queryClient = useQueryClient()

  const { data: mechanics, isLoading } = useQuery({
    queryKey: ['mechanics'],
    queryFn: getMechanics,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanics'] })
      toast.success('Mecânico removido com sucesso')
    },
    onError: () => {
      toast.error('Erro ao remover mecânico')
    },
  })

  const availabilityMutation = useMutation({
    mutationFn: ({ id, available }: { id: string; available: boolean }) =>
      setMechanicAvailability(id, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanics'] })
      toast.success('Disponibilidade atualizada')
    },
    onError: () => {
      toast.error('Erro ao atualizar disponibilidade')
    },
  })

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'specialty', label: 'Especialidade' },
    { key: 'phone', label: 'Telefone' },
    {
      key: 'isAvailable',
      label: 'Disponibilidade',
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {value ? 'Disponível' : 'Ocupado'}
        </span>
      ),
    },
  ]

  const actions = [
    {
      label: 'Editar',
      onClick: (mechanic: Mechanic) => {
        setSelectedMechanic(mechanic)
        setIsModalOpen(true)
      },
    },
    {
      label: 'Alternar disponibilidade',
      onClick: (mechanic: Mechanic) => {
        availabilityMutation.mutate({ id: mechanic.id, available: !mechanic.isAvailable })
      },
    },
    {
      label: 'Excluir',
      onClick: (mechanic: Mechanic) => {
        if (window.confirm(`Tem certeza que deseja excluir ${mechanic.name}?`)) {
          deleteMutation.mutate(mechanic.id)
        }
      },
      className: 'text-red-600 hover:text-red-800',
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mecânicos</h1>
            <p className="text-gray-600">Gerencie a equipe de mecânicos da oficina</p>
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
