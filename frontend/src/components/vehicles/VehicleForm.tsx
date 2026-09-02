import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createVehicle, updateVehicle } from '@/api/vehicles'
import { getClients } from '@/api/clients'
import { Vehicle, VehicleRequest } from '@/types/vehicle'
import Modal from '@/components/common/Modal/Modal'
import Input from '@/components/common/Forms/Input'
import Select from '@/components/common/Forms/Select'

const vehicleSchema = z.object({
  plate: z.string().min(1, 'Placa é obrigatória'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  year: z.coerce.number().min(1900, 'Ano inválido'),
  mileage: z.coerce.number().optional(),
  fuelType: z.string().optional(),
  clientId: z.string().min(1, 'Cliente é obrigatório'),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

interface VehicleFormProps {
  isOpen: boolean
  onClose: () => void
  vehicle?: Vehicle | null
}

export default function VehicleForm({ isOpen, onClose, vehicle }: VehicleFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!vehicle

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
    enabled: isOpen,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  })

  useEffect(() => {
    if (vehicle) {
      reset({
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        mileage: vehicle.mileage,
        fuelType: vehicle.fuelType || '',
        clientId: vehicle.clientId,
      })
    } else {
      reset({
        plate: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: undefined,
        fuelType: '',
        clientId: '',
      })
    }
  }, [vehicle, reset])

  const createMutation = useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Veículo criado com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao criar veículo')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: VehicleRequest }) =>
      updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Veículo atualizado com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao atualizar veículo')
    },
  })

  const onSubmit = async (data: VehicleFormData) => {
    const requestData: VehicleRequest = {
      plate: data.plate,
      brand: data.brand,
      model: data.model,
      year: data.year,
      mileage: data.mileage,
      fuelType: data.fuelType || undefined,
      clientId: data.clientId,
    }

    if (isEditing && vehicle) {
      await updateMutation.mutateAsync({ id: vehicle.id, data: requestData })
    } else {
      await createMutation.mutateAsync(requestData)
    }
  }

  const clientOptions = (clients || []).map((client) => ({
    value: client.id,
    label: client.name,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Veículo' : 'Novo Veículo'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Cliente"
          {...register('clientId')}
          error={errors.clientId?.message}
          options={clientOptions}
          placeholder="Selecione um cliente"
          required
        />
        <Input
          label="Placa"
          {...register('plate')}
          error={errors.plate?.message}
          placeholder="ABC1D23"
          required
        />
        <Input
          label="Marca"
          {...register('brand')}
          error={errors.brand?.message}
          required
        />
        <Input
          label="Modelo"
          {...register('model')}
          error={errors.model?.message}
          required
        />
        <Input
          label="Ano"
          type="number"
          {...register('year')}
          error={errors.year?.message}
          required
        />
        <Input
          label="Quilometragem"
          type="number"
          {...register('mileage')}
          error={errors.mileage?.message}
        />
        <Input
          label="Combustível"
          {...register('fuelType')}
          error={errors.fuelType?.message}
          placeholder="Flex, Gasolina, Diesel..."
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
