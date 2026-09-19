import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface JwtPayload {
  sub: string; // userId
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>("JWT_SECRET"),
    });
  }

  // Executado a cada requisição autenticada: busca o usuário no banco (em vez de
  // confiar cegamente no payload do token) para respeitar isActive/alterações de
  // papel em tempo real — equivalente ao UserDetailsServiceImpl.loadUserByUsername
  // chamado pelo JwtAuthenticationFilter original a cada request.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Usuário não encontrado ou inativo");
    }
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
