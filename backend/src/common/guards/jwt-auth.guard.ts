import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

// Aplicado globalmente (ver app.module.ts) para que toda rota exija um JWT válido
// por padrão, com exceção das marcadas @Public() — espelha o
// ".anyRequest().authenticated()" do SecurityConfig.java original, com
// permitAll() apenas em /auth/login, /auth/register e /auth/refresh.
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
