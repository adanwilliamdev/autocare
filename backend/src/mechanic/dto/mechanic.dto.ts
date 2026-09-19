import { IsNotEmpty, IsOptional } from "class-validator";

export class MechanicRequestDto {
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsOptional()
  specialty?: string;

  @IsOptional()
  phone?: string;

  // Opcional: vincula este perfil de mecânico a uma conta de login (User com role
  // MECHANIC), permitindo que o próprio mecânico acesse suas OS pelo sistema.
  @IsOptional()
  userId?: string;
}
