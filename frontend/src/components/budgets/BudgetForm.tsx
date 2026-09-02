import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBudget } from '@/api/budgets'
import { getClients } from '@/api/clients'
import { getVehiclesByClient } from '@/api/vehicles'
import { BudgetRequest } from '@/types/budget'
import Modal from '@/components/common/Modal/Modal'
import Select from '@/components/common/Forms/Select'
import Input from '@/components/common/Forms/Input'

const budgetSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  vehicleId: z.string().min(1, 'Veículo é obrigatório'),
  description: z.string().optional(),
  totalAmount: z.coerce.number().positive('Valor deve ser positivo'),
  validUntil: z.string().optional(),
})

type BudgetFormData = z.infer<typeof budgetSchema>

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function BudgetForm({ isOpen, onClose }: BudgetFormProps) {
  const queryClient = useQueryClient()
  const [selectedClientId, setSelectedClientId] = useState('')

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
    enabled: isOpen,
  })

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', selectedClientId],
    queryFn: () => getVehiclesByClient(selectedClientId),
    enabled: isOpen && !!selectedClientId,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
  })

  const clientId = watch('clientId')

  useEffect(() => {
    setSelectedClientId(clientId || '')
  }, [clientId])

  useEffect(() => {
    if (isOpen) {
      reset({ clientId: '', vehicleId: '', description: '', totalAmount: 0, validUntil: '' })
      setSelectedClientId('')
    }
  }, [isOpen, reset])

  const createMutation = useMutation({
    mutationFn: createBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      toast.success('Orçamento criado com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao criar orçamento')
    },
  })

  const onSubmit = async (data: BudgetFormData) => {
    const requestData: BudgetRequest = {
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      description: data.description || undefined,
      totalAmount: data.totalAmount,
      validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
    }
    await createMutation.mutateAsync(requestData)
  }

  const clientOptions = (clients || []).map((client) => ({ value: client.id, label: client.name }))
  const vehicleOptions = (vehicles || []).map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`,
  }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Orçamento">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Cliente"
          {...register('clientId')}
          error={errors.clientId?.message}
          options={clientOptions}
          placeholder="Selecione um cliente"
          required
        />
        <Select
          label="Veículo"
          {...register('vehicleId')}
          error={errors.vehicleId?.message}
          options={vehicleOptions}
          placeholder={selectedClientId ? 'Selecione um veículo' : 'Selecione um cliente primeiro'}
          disabled={!selectedClientId}
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea
            className="input-field"
            rows={3}
            {...register('description')}
            placeholder="Serviços e peças previstos"
          />
        </div>
        <Input
          label="Valor total"
          type="number"
          step="0.01"
          {...register('totalAmount')}
          error={errors.totalAmount?.message}
          required
        />
        <Input
          label="Válido até"
          type="date"
          {...register('validUntil')}
          error={errors.validUntil?.message}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Salvando...' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
