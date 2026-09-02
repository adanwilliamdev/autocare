import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient, updateClient } from '@/api/clients'
import { Client, ClientRequest } from '@/types/client'
import Modal from '@/components/common/Modal/Modal'
import Input from '@/components/common/Forms/Input'

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  client?: Client | null
}

export default function ClientForm({ isOpen, onClose, client }: ClientFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!client

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        cpf: client.cpf || '',
        phone: client.phone || '',
        email: client.email || '',
        address: client.address || '',
      })
    } else {
      reset({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        address: '',
      })
    }
  }, [client, reset])

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente criado com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao criar cliente')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientRequest }) =>
      updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente atualizado com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao atualizar cliente')
    },
  })

  const onSubmit = async (data: ClientFormData) => {
    const requestData: ClientRequest = {
      name: data.name,
      cpf: data.cpf || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
    }

    if (isEditing && client) {
      await updateMutation.mutateAsync({ id: client.id, data: requestData })
    } else {
      await createMutation.mutateAsync(requestData)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Novo Cliente'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          {...register('name')}
          error={errors.name?.message}
          required
        />
        <Input
          label="CPF"
          {...register('cpf')}
          error={errors.cpf?.message}
          placeholder="123.456.789-00"
        />
        <Input
          label="Telefone"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="(11) 99999-9999"
        />
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Endereço"
          {...register('address')}
          error={errors.address?.message}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}