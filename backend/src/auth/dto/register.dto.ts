import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

// Propositalmente SEM campo "role": o autocadastro público (POST /auth/register)
// sempre cria a conta com o papel mínimo (RECEPTIONIST) — ver AuthService.register.
// Contas com papéis elevados só podem ser criadas por um ADMIN via POST /auth/users
// (ver CreateUserDto).
export class RegisterDto {
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "Email é obrigatório" })
  email: string;

  @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  @IsNotEmpty({ message: "Senha é obrigatória" })
  password: string;
}
