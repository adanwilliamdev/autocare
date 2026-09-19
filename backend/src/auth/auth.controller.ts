import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Public } from "../common/decorators/public.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "@prisma/client";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Public()
  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto);
  }

  // Autocadastro público. Sempre cria a conta como RECEPTIONIST — ver AuthService.register.
  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    await this.authService.register(dto);
  }

  // Criação de usuário com papel arbitrário (ADMIN, MANAGER, MECHANIC, RECEPTIONIST).
  // Restrito a administradores — não fica em @Public(), então passa pelo JwtAuthGuard
  // global, e o RolesGuard abaixo garante que só um ADMIN autenticado pode chamar.
  @Post("users")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto) {
    await this.authService.createUserByAdmin(dto);
  }
}
