export const PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/

/** Remove espaços e hífen e põe em maiúsculas: "abc-1d23" -> "ABC1D23". */
export const normalizePlate = (plate: string): string => plate.toUpperCase().replace(/[\s-]/g, "")

export const validatePlate = (plate: string): boolean => PLATE_PATTERN.test(normalizePlate(plate))

export const validateCPF = (input: string): boolean => {
  const cpf = input.replace(/\D/g, "")
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false

  const digit = (length: number) => {
    let sum = 0
    for (let i = 0; i < length; i++) sum += parseInt(cpf.charAt(i)) * (length + 1 - i)
    const remainder = 11 - (sum % 11)
    return remainder >= 10 ? 0 : remainder
  }

  return digit(9) === parseInt(cpf.charAt(9)) && digit(10) === parseInt(cpf.charAt(10))
}
