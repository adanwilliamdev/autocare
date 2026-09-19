import { IsDateString, IsNotEmpty, IsOptional, IsPositive } from "class-validator";
import { Type } from "class-transformer";

export class BudgetRequestDto {
  @IsNotEmpty({ message: "ID do cliente é obrigatório" })
  clientId: string;

  @IsNotEmpty({ message: "ID do veículo é obrigatório" })
  vehicleId: string;

  @IsOptional()
  serviceOrderId?: string;

  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsPositive({ message: "Valor total deve ser positivo" })
  totalAmount: number;

  @IsOptional()
  @IsDateString()
  validUntil?: string;
}
