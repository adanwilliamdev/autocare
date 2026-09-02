import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Layout from '@/components/common/Layout/Layout'
import DataTable from '@/components/common/Table/DataTable'
import { getParts, deletePart } from '@/api/inventory'
import { Part } from '@/types/inventory'
import PartForm from '@/components/inventory/PartForm'

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const queryClient = useQueryClient()

  const { data: parts, isLoading } = useQuery({
    queryKey: ['parts'],
    queryFn: getParts,
  })

  const deleteMutation = useMutation({
    mutationFn: deletePart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      toast.success('Peça removida com sucesso')
    },
    onError: () => {
      toast.error('Erro ao remover peça')
    },
  })

  const columns = [
    { key: 'code', label: 'Código' },
    { key: 'name', label: 'Nome' },
    { key: 'manufacturer', label: 'Fabricante' },
    { key: 'stockQuantity', label: 'Estoque' },
    {
      key: 'salePrice',
      label: 'Preço de venda',
      render: (value: number) =>
        (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
    {
      key: 'isLowStock',
      label: 'Status',
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {value ? 'Estoque baixo' : 'Normal'}
        </span>
      ),
    },
  ]

  const actions = [
    {
      label: 'Editar',
      onClick: (part: Part) => {
        setSelectedPart(part)
        setIsModalOpen(true)
      },
    },
    {
      label: 'Excluir',
      onClick: (part: Part) => {
        if (window.confirm(`Tem certeza que deseja excluir ${part.name}?`)) {
          deleteMutation.mutate(part.id)
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
            <h1 className="text-2xl font-bold text-gray-900">Estoque</h1>
            <p className="text-gray-600">Controle de peças e movimentações</p>
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
