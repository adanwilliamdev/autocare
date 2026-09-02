export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '')

  if (cpf.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false

  // Calcula primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  let digit = remainder === 10 || remainder === 11 ? 0 : remainder
  if (parseInt(cpf.charAt(9)) !== digit) return false

  // Calcula segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  digit = remainder === 10 || remainder === 11 ? 0 : remainder
  if (parseInt(cpf.charAt(10)) !== digit) return false

  return true
}

export const validatePlate = (plate: string): boolean => {
  const pattern = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/
  return pattern.test(plate.toUpperCase())
}