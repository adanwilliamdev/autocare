import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthUser } from "../../auth/jwt.strategy";

// Equivalente a SecurityUtils.getCurrentUser()/getCurrentUserId() do backend original:
// sempre lê o usuário autenticado do token, nunca de um parâmetro enviado pelo cliente.
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    return data ? user?.[data] : user;
  },
);
