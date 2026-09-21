"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormActions } from "@/components/form-actions"
import { FormDialog } from "@/components/form-dialog"
import { TextField } from "@/components/form-fields"
import { Form } from "@/components/ui/form"
import { useMoveStock, type StockMovementKind } from "@/features/inventory/queries"
import type { Part } from "@/types"

const schema = z.object({
  quantity: z.number({ error: "Informe a quantidade" }).int("Use um número inteiro").positive("Quantidade deve ser positiva"),
  reason: z.string(),
})

type Values = z.infer<typeof schema>

function StockBody({ part, kind, onClose }: { part: Part; kind: StockMovementKind; onClose: () => void }) {
  const move = useMoveStock()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { quantity: 1, reason: "" } })

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((values) =>
          move.mutate({ id: part.id, kind, quantity: values.quantity, reason: values.reason || null }, { onSuccess: onClose })
        )}
      >
        <p className="text-sm text-graphite-500">
          Estoque atual: <span className="font-mono font-medium text-graphite-800">{part.stockQuantity}</span>
        </p>
        <TextField control={form.control} name="quantity" label="Quantidade" type="number" min={1} required />
        <TextField control={form.control} name="reason" label="Motivo" placeholder={kind === "ENTRADA" ? "Compra, devolução..." : "Venda, uso em OS..."} />
        <FormActions onCancel={onClose} isSubmitting={move.isPending} submitLabel="Confirmar" />
      </form>
    </Form>
  )
}

export function StockDialog({
  target,
  onClose,
}: {
  target: { part: Part; kind: StockMovementKind } | null
  onClose: () => void
}) {
  return (
    <FormDialog
      open={!!target}
      onOpenChange={(next) => !next && onClose()}
      title={target?.kind === "ENTRADA" ? "Entrada de estoque" : "Saída de estoque"}
      description={target ? `${target.part.code} · ${target.part.name}` : ""}
    >
      {target && <StockBody part={target.part} kind={target.kind} onClose={onClose} />}
    </FormDialog>
  )
}
