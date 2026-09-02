import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPart, updatePart } from '@/api/inventory'
import { Part, PartRequest } from '@/types/inventory'
import Modal from '@/components/common/Modal/Modal'
import Input from '@/components/common/Forms/Input'

const partSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().min(1, 'Código é obrigatório'),
  manufacturer: z.string().optional(),
  purchasePrice: z.coerce.number().positive('Preço de compra deve ser positivo'),
  salePrice: z.coerce.number().positive('Preço de venda deve ser positivo'),
  stockQuantity: z.coerce.number().nonnegative('Quantidade em estoque inválida'),
  minimumStock: z.coerce.number().optional(),
})

type PartFormData = z.infer<typeof partSchema>

interface PartFormProps {
  isOpen: boolean
  onClose: () => void
  part?: Part | null
}

export default function PartForm({ isOpen, onClose, part }: PartFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!part

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PartFormData>({
    resolver: zodResolver(partSchema),
  })

  useEffect(() => {
    if (part) {
      reset({
        name: part.name,
        code: part.code,
        manufacturer: part.manufacturer || '',
        purchasePrice: part.purchasePrice,
        salePrice: part.salePrice,
        stockQuantity: part.stockQuantity,
        minimumStock: part.minimumStock,
      })
    } else {
      reset({
        name: '',
        code: '',
        manufacturer: '',
        purchasePrice: 0,
        salePrice: 0,
        stockQuantity: 0,
        minimumStock: 5,
      })
    }
  }, [part, reset])

  const createMutation = useMutation({
    mutationFn: createPart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      toast.success('Peça criada com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao criar peça')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PartRequest }) => updatePart(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      toast.success('Peça atualizada com sucesso')
      onClose()
    },
    onError: () => {
      toast.error('Erro ao atualizar peça')
    },
  })

  const onSubmit = async (data: PartFormData) => {
    const requestData: PartRequest = {
      name: data.name,
      code: data.code,
      manufacturer: data.manufacturer || undefined,
      purchasePrice: data.purchasePrice,
      salePrice: data.salePrice,
      stockQuantity: data.stockQuantity,
      minimumStock: data.minimumStock,
    }

    if (isEditing && part) {
      await updateMutation.mutateAsync({ id: part.id, data: requestData })
    } else {
      await createMutation.mutateAsync(requestData)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Peça' : 'Nova Peça'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nome" {...register('name')} error={errors.name?.message} required />
        <Input label="Código" {...register('code')} error={errors.code?.message} required />
        <Input
          label="Fabricante"
          {...register('manufacturer')}
          error={errors.manufacturer?.message}
        />
        <Input
          label="Preço de compra"
          type="number"
          step="0.01"
          {...register('purchasePrice')}
          error={errors.purchasePrice?.message}
          required
        />
        <Input
          label="Preço de venda"
          type="number"
          step="0.01"
          {...register('salePrice')}
          error={errors.salePrice?.message}
          required
        />
        <Input
          label="Quantidade em estoque"
          type="number"
          {...register('stockQuantity')}
          error={errors.stockQuantity?.message}
          required
        />
        <Input
          label="Estoque mínimo"
          type="number"
          {...register('minimumStock')}
          error={errors.minimumStock?.message}
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
