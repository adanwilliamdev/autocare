import { useState } from 'react'
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
        <span className={`badge ${value ? 'bg-moss-50 text-moss-700' : 'bg-rust-50 text-rust-500'}`}>
          <span className={`badge-dot ${value ? 'bg-moss-500' : 'bg-rust-400'}`} />
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
      className: 'text-rust-500 hover:text-rust-600',
    },
    {
      label: 'Ativar',
      onClick: (client: Client) => {
        activateMutation.mutate(client.id)
      },
      className: 'text-moss-600 hover:text-moss-700',
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-semibold text-graphite-900">Clientes</h1>
            <p className="text-graphite-500">Gerencie todos os clientes da oficina</p>
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