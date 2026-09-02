import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMechanic, updateMechanic } from '@/api/mechanics'
import { Mechanic, MechanicRequest } from '@/types/mechanic'
import Modal from '@/components/common/Modal/Modal'
import Input from '@/components/common/Forms/Input'

const mechanicSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  specialty: z.string().optional(),
  phone: z.string().optional(),
})

type MechanicFormData = z.infer<typeof mechanicSchema>

interface MechanicFormProps {
  isOpen: boolean
  onClose: () => void
  mechanic?: Mechanic | null
}

export default function MechanicForm({ isOpen, onClose, mechanic }: MechanicFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!mechanic

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MechanicFormData>({
    resolver: zodResolver(mechanicSchema),
  })

  useEffect(() => {
    if (mechanic) {
      reset({
        name: mechanic.name,
        specialty: mechanic.specialty || '',
        phone: mechanic.phone || '',
      })
    } else {
      reset({ name: '', specialty: '', phone: '' })
    }
  }, [mechanic, reset])

  const createMutation = useMutation({
    mutationFn: createMechanic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanics'] })
      toast.success('Mecânico criado com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao criar mecânico')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MechanicRequest }) =>
      updateMechanic(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mechanics'] })
      toast.success('Mecânico atualizado com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao atualizar mecânico')
    },
  })

  const onSubmit = async (data: MechanicFormData) => {
    const requestData: MechanicRequest = {
      name: data.name,
      specialty: data.specialty || undefined,
      phone: data.phone || undefined,
    }

    if (isEditing && mechanic) {
      await updateMutation.mutateAsync({ id: mechanic.id, data: requestData })
    } else {
      await createMutation.mutateAsync(requestData)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Mecânico' : 'Novo Mecânico'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nome" {...register('name')} error={errors.name?.message} required />
        <Input
          label="Especialidade"
          {...register('specialty')}
          error={errors.specialty?.message}
          placeholder="Motor, Suspensão, Elétrica..."
        />
        <Input
          label="Telefone"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="(11) 99999-9999"
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
