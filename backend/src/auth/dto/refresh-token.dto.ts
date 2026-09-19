import { IsNotEmpty } from "class-validator";

export class RefreshTokenDto {
  @IsNotEmpty({ message: "Refresh token é obrigatório" })
  refreshToken: string;
}
