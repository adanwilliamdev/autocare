import { IsNotEmpty, IsOptional, IsPositive, Min } from "class-validator";
import { Type } from "class-transformer";

export class PartRequestDto {
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsNotEmpty({ message: "Código é obrigatório" })
  code: string;

  @IsOptional()
  manufacturer?: string;

  @Type(() => Number)
  @IsPositive({ message: "Preço de compra deve ser positivo" })
  purchasePrice: number;

  @Type(() => Number)
  @IsPositive({ message: "Preço de venda deve ser positivo" })
  salePrice: number;

  @Type(() => Number)
  @Min(0, { message: "Quantidade em estoque deve ser positiva" })
  stockQuantity: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: "Estoque mínimo deve ser positivo" })
  minimumStock?: number;
}
