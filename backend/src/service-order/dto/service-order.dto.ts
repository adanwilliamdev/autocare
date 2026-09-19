import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { ServiceOrderStatus } from "@prisma/client";

export class ServiceOrderRequestDto {
  @IsNotEmpty({ message: "ID do cliente é obrigatório" })
  clientId: string;

  @IsNotEmpty({ message: "ID do veículo é obrigatório" })
  vehicleId: string;

  @IsOptional()
  mechanicId?: string;

  @IsOptional()
  reportedProblem?: string;
}

export class StatusUpdateRequestDto {
  @IsEnum(ServiceOrderStatus, { message: "Status é obrigatório" })
  status: ServiceOrderStatus;

  @IsOptional()
  diagnosis?: string;
}
