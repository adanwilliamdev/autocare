import { IsInt, IsNotEmpty, IsOptional, Matches, Min } from "class-validator";
import { Type } from "class-transformer";

export class VehicleRequestDto {
  @IsNotEmpty({ message: "Placa é obrigatória" })
  @Matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, {
    message: "Placa inválida. Formato: ABC1D23 ou ABC1234",
  })
  plate: string;

  @IsNotEmpty({ message: "Marca é obrigatória" })
  brand: string;

  @IsNotEmpty({ message: "Modelo é obrigatório" })
  model: string;

  @Type(() => Number)
  @IsInt()
  @Min(1, { message: "Ano deve ser positivo" })
  year: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: "Quilometragem não pode ser negativa" })
  mileage?: number;

  @IsOptional()
  fuelType?: string;

  @IsNotEmpty({ message: "ID do cliente é obrigatório" })
  clientId: string;
}
