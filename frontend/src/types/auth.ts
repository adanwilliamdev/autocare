export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'RECEPTIONIST' | 'MECHANIC' | 'MANAGER'
  createdAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  userId: string
  name: string
  email: string
  role: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  // Propositalmente sem "role": o autocadastro público sempre cria uma conta
  // RECEPTIONIST no backend (ver AuthService.register). Contas com outros papéis
  // são criadas por um ADMIN via POST /auth/users.
}
