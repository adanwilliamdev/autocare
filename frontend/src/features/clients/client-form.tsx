"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/form-actions"
import { FormDialog } from "@/components/form-dialog"
import { TextField } from "@/components/form-fields"
import { Form } from "@/components/ui/form"
import { useCreateClient, useUpdateClient } from "@/features/clients/queries"
import type { Client } from "@/types"

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string(),
  phone: z.string(),
  email: z.union([z.literal(""), z.email("Email inválido")]),
  address: z.string(),
})

type Values = z.infer<typeof schema>

function ClientFormBody({ client, onClose }: { client: Client | null; onClose: () => void }) {
  const create = useCreateClient()
  const update = useUpdateClient()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: client?.name ?? "",
      cpf: client?.cpf ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
      address: client?.address ?? "",
    },
  })
  const isPending = create.isPending || update.isPending

  const onSubmit = (values: Values) => {
    // Vazio vira null: limpa o campo no servidor (e evita "" duplicado na coluna CPF, que é única).
    const data = {
      name: values.name,
      cpf: values.cpf || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
    }
    if (client) update.mutate({ id: client.id, data }, { onSuccess: onClose })
    else create.mutate(data, { onSuccess: onClose })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <TextField control={form.control} name="name" label="Nome" required />
        <TextField control={form.control} name="cpf" label="CPF" placeholder="123.456.789-00" />
        <TextField control={form.control} name="phone" label="Telefone" placeholder="(11) 99999-9999" />
        <TextField control={form.control} name="email" label="Email" type="email" />
        <TextField control={form.control} name="address" label="Endereço" />
        <FormActions onCancel={onClose} isSubmitting={isPending} submitLabel={client ? "Atualizar" : "Criar"} />
      </form>
    </Form>
  )
}

export function ClientForm({
  open,
  onClose,
  client,
}: {
  open: boolean
  onClose: () => void
  client: Client | null
}) {
  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={client ? "Editar Cliente" : "Novo Cliente"}
      description="Dados de contato do cliente da oficina."
    >
      <ClientFormBody client={client} onClose={onClose} />
    </FormDialog>
  )
}
