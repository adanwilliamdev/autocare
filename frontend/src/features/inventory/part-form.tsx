"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/form-actions"
import { FormDialog } from "@/components/form-dialog"
import { TextField } from "@/components/form-fields"
import { Form } from "@/components/ui/form"
import { useCreatePart, useUpdatePart } from "@/features/inventory/queries"
import type { Part } from "@/types"

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  manufacturer: z.string(),
  purchasePrice: z.number({ error: "Preço de compra é obrigatório" }).positive("Preço de compra deve ser positivo"),
  salePrice: z.number({ error: "Preço de venda é obrigatório" }).positive("Preço de venda deve ser positivo"),
  stockQuantity: z.number({ error: "Quantidade é obrigatória" }).int().min(0, "Quantidade em estoque inválida"),
  minimumStock: z.number({ error: "Estoque mínimo é obrigatório" }).int().positive("Estoque mínimo deve ser positivo"),
})

type Values = z.infer<typeof schema>

function PartFormBody({ part, onClose }: { part: Part | null; onClose: () => void }) {
  const create = useCreatePart()
  const update = useUpdatePart()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: part?.name ?? "",
      code: part?.code ?? "",
      manufacturer: part?.manufacturer ?? "",
      purchasePrice: part?.purchasePrice ?? 0,
      salePrice: part?.salePrice ?? 0,
      stockQuantity: part?.stockQuantity ?? 0,
      minimumStock: part?.minimumStock ?? 5,
    },
  })
  const isPending = create.isPending || update.isPending

  const onSubmit = (values: Values) => {
    const data = { ...values, manufacturer: values.manufacturer || null }
    if (part) update.mutate({ id: part.id, data }, { onSuccess: onClose })
    else create.mutate(data, { onSuccess: onClose })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField control={form.control} name="name" label="Nome" required />
        <TextField control={form.control} name="code" label="Código" required />
        <TextField control={form.control} name="manufacturer" label="Fabricante" />
        <div className="grid grid-cols-2 gap-4">
          <TextField control={form.control} name="purchasePrice" label="Preço de compra" type="number" step="0.01" required />
          <TextField control={form.control} name="salePrice" label="Preço de venda" type="number" step="0.01" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Editar a peça nunca altera o estoque: ele só muda por movimentações auditadas. */}
          <TextField
            control={form.control}
            name="stockQuantity"
            label={part ? "Em estoque" : "Quantidade inicial"}
            type="number"
            disabled={!!part}
            required
          />
          <TextField control={form.control} name="minimumStock" label="Estoque mínimo" type="number" />
        </div>
        <FormActions onCancel={onClose} isSubmitting={isPending} submitLabel={part ? "Atualizar" : "Criar"} />
      </form>
    </Form>
  )
}

export function PartForm({ open, onClose, part }: { open: boolean; onClose: () => void; part: Part | null }) {
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={part ? "Editar Peça" : "Nova Peça"}
      description="Cadastro de peças e preços do estoque."
    >
      <PartFormBody part={part} onClose={onClose} />
    </FormDialog>
  )
}
