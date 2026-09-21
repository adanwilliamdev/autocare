import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

export function FormActions({
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </DialogFooter>
  )
}
