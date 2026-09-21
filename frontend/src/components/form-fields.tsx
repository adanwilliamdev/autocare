"use client"

import type { ComponentProps } from "react"
import type { Control, FieldValues, Path } from "react-hook-form"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface BaseFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  required?: boolean
}

const RequiredMark = () => (
  <span aria-hidden className="text-rust-500">
    *
  </span>
)

type InputProps = Omit<ComponentProps<typeof Input>, "name" | "value" | "onChange" | "onBlur" | "ref" | "defaultValue">

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  ...inputProps
}: BaseFieldProps<T> & InputProps) {
  const isNumber = inputProps.type === "number"
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <RequiredMark />}
          </FormLabel>
          <FormControl>
            <Input
              {...inputProps}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value ?? ""}
              // Campo numérico vazio vira undefined (o zod acusa "obrigatório" ou aceita se opcional).
              onChange={(event) =>
                field.onChange(isNumber ? (event.target.value === "" ? undefined : event.target.valueAsNumber) : event.target.value)
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  ...props
}: BaseFieldProps<T> & Omit<ComponentProps<typeof Textarea>, "name" | "value" | "onChange" | "onBlur" | "ref">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <RequiredMark />}
          </FormLabel>
          <FormControl>
            <Textarea {...props} {...field} value={field.value ?? ""} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export interface SelectOption {
  value: string
  label: string
}

// Radix não aceita "" como valor de item; este marcador representa "nenhum" e vira "" no formulário.
const EMPTY = "__empty__"

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  options,
  placeholder,
  emptyOption,
  disabled,
  onValueChange,
}: BaseFieldProps<T> & {
  options: SelectOption[]
  placeholder: string
  /** Rótulo de uma opção "sem seleção" (ex.: "Atribuir depois"). */
  emptyOption?: string
  disabled?: boolean
  onValueChange?: (value: string) => void
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <RequiredMark />}
          </FormLabel>
          <Select
            value={field.value || ""}
            disabled={disabled}
            onValueChange={(next) => {
              const value = next === EMPTY ? "" : next
              field.onChange(value)
              onValueChange?.(value)
            }}
          >
            <FormControl>
              <SelectTrigger onBlur={field.onBlur} ref={field.ref}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {emptyOption && <SelectItem value={EMPTY}>{emptyOption}</SelectItem>}
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
