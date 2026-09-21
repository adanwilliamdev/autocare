"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/form-actions"
import { FormDialog } from "@/components/form-dialog"
import { TextField } from "@/components/form-fields"
import { Form } from "@/components/ui/form"
import { useCreateMechanic, useUpdateMechanic } from "@/features/mechanics/queries"
import type { Mechanic } from "@/types"

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  specialty: z.string(),
  phone: z.string(),
})

type Values = z.infer<typeof schema>

function MechanicFormBody({ mechanic, onClose }: { mechanic: Mechanic | null; onClose: () => void }) {
  const create = useCreateMechanic()
  const update = useUpdateMechanic()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: mechanic?.name ?? "",
      specialty: mechanic?.specialty ?? "",
      phone: mechanic?.phone ?? "",
    },
  })
  const isPending = create.isPending || update.isPending

  const onSubmit = (values: Values) => {
    const data = { name: values.name, specialty: values.specialty || null, phone: values.phone || null }
    if (mechanic) update.mutate({ id: mechanic.id, data }, { onSuccess: onClose })
    else create.mutate(data, { onSuccess: onClose })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField control={form.control} name="name" label="Nome" required />
        <TextField control={form.control} name="specialty" label="Especialidade" placeholder="Motor, Suspensão, Elétrica..." />
        <TextField control={form.control} name="phone" label="Telefone" placeholder="(11) 99999-9999" />
        <FormActions onCancel={onClose} isSubmitting={isPending} submitLabel={mechanic ? "Atualizar" : "Criar"} />
      </form>
    </Form>
  )
}

export function MechanicForm({
  open,
  onClose,
  mechanic,
}: {
  open: boolean
  onClose: () => void
  mechanic: Mechanic | null
}) {
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={mechanic ? "Editar Mecânico" : "Novo Mecânico"}
      description="Cadastro da equipe de mecânicos da oficina."
    >
      <MechanicFormBody mechanic={mechanic} onClose={onClose} />
    </FormDialog>
  )
}
