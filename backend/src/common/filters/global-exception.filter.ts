import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Response } from "express";
import { Prisma } from "@prisma/client";

/**
 * Equivalente ao GlobalExceptionHandler.java (@RestControllerAdvice). Centraliza o
 * shape de erro retornado ao cliente e garante que exceções inesperadas nunca vazem
 * stack traces, mas sejam logadas no servidor.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("ExceptionFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === "P2002" || exception.code === "P2003") {
        return response.status(HttpStatus.CONFLICT).json({
          timestamp: new Date().toISOString(),
          message:
            "Operação viola uma restrição de integridade dos dados (ex.: registro duplicado ou vínculo existente)",
          status: HttpStatus.CONFLICT,
        });
      }
      if (exception.code === "P2025") {
        return response.status(HttpStatus.NOT_FOUND).json({
          timestamp: new Date().toISOString(),
          message: "Registro não encontrado",
          status: HttpStatus.NOT_FOUND,
        });
      }
    }

    if (exception instanceof BadRequestException) {
      const body = exception.getResponse() as any;
      const errors = Array.isArray(body?.message) ? body.message : undefined;
      return response.status(HttpStatus.BAD_REQUEST).json({
        timestamp: new Date().toISOString(),
        status: HttpStatus.BAD_REQUEST,
        message: errors ? undefined : body?.message ?? exception.message,
        errors,
      });
    }

    if (exception instanceof UnauthorizedException) {
      return response.status(HttpStatus.UNAUTHORIZED).json({
        timestamp: new Date().toISOString(),
        message: exception.message || "Falha na autenticação",
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    if (exception instanceof ForbiddenException) {
      return response.status(HttpStatus.FORBIDDEN).json({
        timestamp: new Date().toISOString(),
        message: "Você não tem permissão para executar esta ação",
        status: HttpStatus.FORBIDDEN,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message = typeof body === "string" ? body : (body as any)?.message ?? exception.message;
      return response.status(status).json({
        timestamp: new Date().toISOString(),
        message,
        status,
      });
    }

    this.logger.error("Erro não tratado ao processar requisição", (exception as Error)?.stack);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      timestamp: new Date().toISOString(),
      message: "Erro interno do servidor",
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    });
  }
}
