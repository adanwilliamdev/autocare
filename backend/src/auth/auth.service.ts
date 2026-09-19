import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessException, ResourceNotFoundException } from "../common/exceptions";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Role } from "@prisma/client";

const REFRESH_TOKEN_VALIDITY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Mensagem genérica de propósito (não revela se o email existe) — equivalente ao
    // BadCredentialsException tratado pelo GlobalExceptionHandler original (401).
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException("Email ou senha inválidos");
    }

    const token = this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.issueRefreshToken(user.id);

    return this.buildLoginResponse(user, token, refreshToken);
  }

  async refresh(dto: RefreshTokenDto) {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: dto.refreshToken },
    });
    if (!storedToken) {
      throw new BusinessException("Refresh token inválido");
    }
    if (storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new BusinessException("Refresh token expirado ou revogado. Faça login novamente");
    }

    const user = await this.prisma.user.findUnique({ where: { id: storedToken.userId } });
    if (!user) {
      throw new ResourceNotFoundException("Usuário não encontrado");
    }

    // Rotaciona o refresh token: o antigo não pode mais ser reutilizado.
    await this.prisma.refreshToken.update({
      where: { token: storedToken.token },
      data: { revoked: true },
    });
    const newRefreshToken = await this.issueRefreshToken(user.id);
    const newAccessToken = this.generateAccessToken(user.id, user.email);

    return this.buildLoginResponse(user, newAccessToken, newRefreshToken);
  }

  async logout(dto: RefreshTokenDto) {
    await this.prisma.refreshToken.updateMany({
      where: { token: dto.refreshToken },
      data: { revoked: true },
    });
  }

  // Autocadastro público. Por segurança, SEMPRE cria a conta com o papel mínimo
  // (RECEPTIONIST) — não existe campo "role" em RegisterDto. Um usuário
  // mal-intencionado não consegue se autopromover a ADMIN por aqui.
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) {
      throw new BusinessException("Este email já está cadastrado");
    }

    await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        role: Role.RECEPTIONIST,
        isActive: true,
      },
    });
  }

  // Criação de usuário com papel arbitrário. Só pode ser chamado por um ADMIN
  // autenticado (a restrição fica no RolesGuard do controller).
  async createUserByAdmin(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) {
      throw new BusinessException("Este email já está cadastrado");
    }

    const roleValue = dto.role?.toUpperCase();
    if (!Object.values(Role).includes(roleValue as Role)) {
      throw new BusinessException(`Papel inválido: ${dto.role}`);
    }

    await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        role: roleValue as Role,
        isActive: true,
      },
    });
  }

  private generateAccessToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  private async issueRefreshToken(userId: string): Promise<string> {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_VALIDITY_DAYS);

    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt, revoked: false },
    });
    return token;
  }

  private buildLoginResponse(
    user: { id: string; name: string; email: string; role: Role },
    token: string,
    refreshToken: string,
  ) {
    return {
      token,
      refreshToken,
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
