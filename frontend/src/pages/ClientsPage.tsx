import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Layout from '@/components/common/Layout/Layout'
import DataTable from '@/components/common/Table/DataTable'
import { getClients, deleteClient, activateClient } from '@/api/clients'
import { Client } from '@/types/client'
import ClientForm from '@/components/clients/ClientForm'

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const queryClient = useQueryClient()

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente removido com sucesso')
    },
    onError: () => {
      toast.error('Erro ao remover cliente')
    },
  })

  const activateMutation = useMutation({
    mutationFn: activateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente ativado com sucesso')
    },
    onError: () => {
      toast.error('Erro ao ativar cliente')
    },
  })

  const columns = [
    { key: 'name', label: 'Nome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'phone', label: 'Telefone' },
    { key: 'email', label: 'Email' },
    { key: 'vehicleCount', label: 'Veículos' },
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

  const actions = [
    {
      label: 'Editar',
      onClick: (client: Client) => {
        setSelectedClient(client)
        setIsModalOpen(true)
      },
    },
    {
      label: 'Excluir',
      onClick: (client: Client) => {
        if (window.confirm(`Tem certeza que deseja excluir ${client.name}?`)) {
          deleteMutation.mutate(client.id)
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
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-gray-600">Gerencie todos os clientes da oficina</p>
          </div>
          <button
            onClick={() => {
              setSelectedClient(null)
              setIsModalOpen(true)
            }}
            className="btn-primary"
          >
            + Novo Cliente
          </button>
        </div>

        <DataTable
          data={clients || []}
          columns={columns}
          isLoading={isLoading}
          actions={actions}
        />

        <ClientForm
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedClient(null)
          }}
          client={selectedClient}
        />
      </div>
    </Layout>
  )
}