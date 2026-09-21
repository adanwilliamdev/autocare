"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/form-actions"
import { FormDialog } from "@/components/form-dialog"
import { SelectField, TextareaField, TextField } from "@/components/form-fields"
import { Form } from "@/components/ui/form"
import { useCreateBudget } from "@/features/budgets/queries"
import { useClients } from "@/features/clients/queries"
import { useVehiclesByClient } from "@/features/vehicles/queries"

const schema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  description: z.string(),
  totalAmount: z.number({ error: "Valor é obrigatório" }).positive("Valor deve ser positivo"),
  validUntil: z.string(),
})

type Values = z.infer<typeof schema>

function BudgetFormBody({ onClose }: { onClose: () => void }) {
  const create = useCreateBudget()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { clientId: "", vehicleId: "", description: "", totalAmount: undefined, validUntil: "" },
  })
  const clientId = useWatch({ control: form.control, name: "clientId" })

  const { data: clients } = useClients()
  const { data: vehicles } = useVehiclesByClient(clientId)

  const onSubmit = (values: Values) =>
    create.mutate(
      {
        clientId: values.clientId,
        vehicleId: values.vehicleId,
        description: values.description || null,
        totalAmount: values.totalAmount,
        // Válido até o fim do dia escolhido, no fuso do usuário (meia-noite UTC cairia no dia anterior).
        validUntil: values.validUntil ? new Date(`${values.validUntil}T23:59:59`).toISOString() : null,
      },
      { onSuccess: onClose }
    )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <SelectField
          control={form.control}
          name="clientId"
          label="Cliente"
          required
          placeholder="Selecione um cliente"
          options={(clients ?? []).map((c) => ({ value: c.id, label: c.name }))}
          onValueChange={() => form.setValue("vehicleId", "")}
        />
        <SelectField
          control={form.control}
          name="vehicleId"
          label="Veículo"
          required
          disabled={!clientId}
          placeholder={clientId ? "Selecione um veículo" : "Selecione um cliente primeiro"}
          options={(vehicles ?? []).map((v) => ({ value: v.id, label: `${v.plate} - ${v.brand} ${v.model}` }))}
        />
        <TextareaField control={form.control} name="description" label="Descrição" rows={3} placeholder="Serviços e peças previstos" />
        <TextField control={form.control} name="totalAmount" label="Valor total" type="number" step="0.01" required />
        <TextField control={form.control} name="validUntil" label="Válido até" type="date" />
        <FormActions onCancel={onClose} isSubmitting={create.isPending} submitLabel="Criar" />
      </form>
    </Form>
  )
}

export function BudgetForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Novo Orçamento"
      description="Valor previsto para os serviços e peças de um veículo."
    >
      <BudgetFormBody onClose={onClose} />
    </FormDialog>
  )
}
