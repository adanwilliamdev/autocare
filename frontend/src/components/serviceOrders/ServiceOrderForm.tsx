import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createServiceOrder } from '@/api/serviceOrders'
import { getClients } from '@/api/clients'
import { getVehiclesByClient } from '@/api/vehicles'
import { getMechanics } from '@/api/mechanics'
import { ServiceOrderRequest } from '@/types/serviceOrder'
import Modal from '@/components/common/Modal/Modal'
import Select from '@/components/common/Forms/Select'

const serviceOrderSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  vehicleId: z.string().min(1, 'Veículo é obrigatório'),
  mechanicId: z.string().optional(),
  reportedProblem: z.string().optional(),
})

type ServiceOrderFormData = z.infer<typeof serviceOrderSchema>

interface ServiceOrderFormProps {
  isOpen: boolean
  onClose: () => void
}

export default function ServiceOrderForm({ isOpen, onClose }: ServiceOrderFormProps) {
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

  const { data: mechanics } = useQuery({
    queryKey: ['mechanics'],
    queryFn: getMechanics,
    enabled: isOpen,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ServiceOrderFormData>({
    resolver: zodResolver(serviceOrderSchema),
  })

  const clientId = watch('clientId')

  useEffect(() => {
    setSelectedClientId(clientId || '')
  }, [clientId])

  useEffect(() => {
    if (isOpen) {
      reset({ clientId: '', vehicleId: '', mechanicId: '', reportedProblem: '' })
      setSelectedClientId('')
    }
  }, [isOpen, reset])

  const createMutation = useMutation({
    mutationFn: createServiceOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] })
      toast.success('Ordem de serviço criada com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao criar ordem de serviço')
    },
  })

  const onSubmit = async (data: ServiceOrderFormData) => {
    const requestData: ServiceOrderRequest = {
      clientId: data.clientId,
      vehicleId: data.vehicleId,
      mechanicId: data.mechanicId || undefined,
      reportedProblem: data.reportedProblem || undefined,
    }
    await createMutation.mutateAsync(requestData)
  }

  const clientOptions = (clients || []).map((client) => ({ value: client.id, label: client.name }))
  const vehicleOptions = (vehicles || []).map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`,
  }))
  const mechanicOptions = (mechanics || []).map((mechanic) => ({
    value: mechanic.id,
    label: mechanic.name,
  }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Ordem de Serviço">
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
        <Select
          label="Mecânico"
          {...register('mechanicId')}
          error={errors.mechanicId?.message}
          options={mechanicOptions}
          placeholder="Atribuir depois"
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Problema relatado</label>
          <textarea
            className="input-field"
            rows={3}
            {...register('reportedProblem')}
            placeholder="Descreva o problema relatado pelo cliente"
          />
        </div>

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
