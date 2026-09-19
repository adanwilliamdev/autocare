import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

// Usado exclusivamente pelo endpoint administrativo de criação de usuários
// (POST /auth/users, restrito a ADMIN via RolesGuard). Diferente de RegisterDto,
// aqui o papel (role) é um campo confiável porque quem chama já foi autenticado
// e autorizado como ADMIN.
export class CreateUserDto {
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "Email é obrigatório" })
  email: string;

  @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  @IsNotEmpty({ message: "Senha é obrigatória" })
  password: string;

  @IsNotEmpty({ message: "Papel (role) é obrigatório" })
  role: string;
}
