const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export const formatCurrency = (value: number | null | undefined): string => currency.format(value ?? 0)

export const formatDate = (date: string): string => new Intl.DateTimeFormat("pt-BR").format(new Date(date))

export const formatDateTime = (date: string): string =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(date))

// Formata só quando o valor tem exatamente os dígitos esperados; senão devolve como veio.
export const formatCPF = (value: string): string =>
  value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")

export const formatPhone = (value: string): string =>
  value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
