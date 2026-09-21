"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/form-actions"
import { FormDialog } from "@/components/form-dialog"
import { SelectField, TextField } from "@/components/form-fields"
import { Form } from "@/components/ui/form"
import { useClients } from "@/features/clients/queries"
import { useCreateVehicle, useUpdateVehicle } from "@/features/vehicles/queries"
import { normalizePlate, validatePlate } from "@/lib/validators"
import type { Vehicle } from "@/types"

const schema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  plate: z
    .string()
    .min(1, "Placa é obrigatória")
    .refine(validatePlate, "Placa inválida. Formato: ABC1D23 ou ABC1234"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.number({ error: "Ano é obrigatório" }).int().min(1900, "Ano inválido"),
  mileage: z.number({ error: "Quilometragem inválida" }).min(0, "Quilometragem deve ser positiva").optional(),
  fuelType: z.string(),
})

type Values = z.infer<typeof schema>

function VehicleFormBody({ vehicle, onClose }: { vehicle: Vehicle | null; onClose: () => void }) {
  const { data: clients } = useClients()
  const create = useCreateVehicle()
  const update = useUpdateVehicle()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientId: vehicle?.clientId ?? "",
      plate: vehicle?.plate ?? "",
      brand: vehicle?.brand ?? "",
      model: vehicle?.model ?? "",
      year: vehicle?.year ?? new Date().getFullYear(),
      mileage: vehicle?.mileage ?? undefined,
      fuelType: vehicle?.fuelType ?? "",
    },
  })
  const isPending = create.isPending || update.isPending

  const onSubmit = (values: Values) => {
    const data = {
      ...values,
      plate: normalizePlate(values.plate),
      mileage: values.mileage ?? null,
      fuelType: values.fuelType || null,
    }
    if (vehicle) update.mutate({ id: vehicle.id, data }, { onSuccess: onClose })
    else create.mutate(data, { onSuccess: onClose })
  }

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
        />
        <TextField control={form.control} name="plate" label="Placa" required placeholder="ABC1D23" />
        <TextField control={form.control} name="brand" label="Marca" required />
        <TextField control={form.control} name="model" label="Modelo" required />
        <TextField control={form.control} name="year" label="Ano" type="number" required />
        <TextField control={form.control} name="mileage" label="Quilometragem" type="number" />
        <TextField control={form.control} name="fuelType" label="Combustível" placeholder="Flex, Gasolina, Diesel..." />
        <FormActions onCancel={onClose} isSubmitting={isPending} submitLabel={vehicle ? "Atualizar" : "Criar"} />
      </form>
    </Form>
  )
}

export function VehicleForm({
  open,
  onClose,
  vehicle,
}: {
  open: boolean
  onClose: () => void
  vehicle: Vehicle | null
}) {
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={vehicle ? "Editar Veículo" : "Novo Veículo"}
      description="Dados do veículo e a quem ele pertence."
    >
      <VehicleFormBody vehicle={vehicle} onClose={onClose} />
    </FormDialog>
  )
}
