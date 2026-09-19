import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class ClientRequestDto {
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsOptional()
  cpf?: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: "Email inválido" })
  email?: string;

  @IsOptional()
  address?: string;
}
