"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/form-actions"
import { FormDialog } from "@/components/form-dialog"
import { SelectField, TextareaField } from "@/components/form-fields"
import { Form } from "@/components/ui/form"
import { useClients } from "@/features/clients/queries"
import { useMechanics } from "@/features/mechanics/queries"
import { useCreateServiceOrder } from "@/features/service-orders/queries"
import { useVehiclesByClient } from "@/features/vehicles/queries"

const schema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  mechanicId: z.string(),
  reportedProblem: z.string(),
})

type Values = z.infer<typeof schema>

function ServiceOrderFormBody({ onClose }: { onClose: () => void }) {
  const create = useCreateServiceOrder()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { clientId: "", vehicleId: "", mechanicId: "", reportedProblem: "" },
  })
  const clientId = useWatch({ control: form.control, name: "clientId" })

  const { data: clients } = useClients()
  const { data: vehicles } = useVehiclesByClient(clientId)
  const { data: mechanics } = useMechanics()

  const onSubmit = (values: Values) =>
    create.mutate(
      {
        clientId: values.clientId,
        vehicleId: values.vehicleId,
        mechanicId: values.mechanicId || null,
        reportedProblem: values.reportedProblem || null,
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
          // Trocar o cliente invalida o veículo escolhido antes.
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
        <SelectField
          control={form.control}
          name="mechanicId"
          label="Mecânico"
          placeholder="Atribuir depois"
          emptyOption="Atribuir depois"
          options={(mechanics ?? []).map((m) => ({ value: m.id, label: m.name }))}
        />
        <TextareaField
          control={form.control}
          name="reportedProblem"
          label="Problema relatado"
          rows={3}
          placeholder="Descreva o problema relatado pelo cliente"
        />
        <FormActions onCancel={onClose} isSubmitting={create.isPending} submitLabel="Criar" />
      </form>
    </Form>
  )
}

export function ServiceOrderForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Nova Ordem de Serviço"
      description="Abra uma ordem de serviço para um veículo do cliente."
    >
      <ServiceOrderFormBody onClose={onClose} />
    </FormDialog>
  )
}
