class AppError(Exception):
    """Erro de domínio que vira uma resposta HTTP com o corpo padrão da API."""

    status_code = 500
    default_message = "Erro interno do servidor"

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


class BusinessError(AppError):
    """Regra de negócio violada -> 400."""

    status_code = 400


class InsufficientStockError(BusinessError):
    pass


class NotFoundError(AppError):
    status_code = 404
    default_message = "Registro não encontrado"


class ConflictError(AppError):
    status_code = 409


class OptimisticLockError(ConflictError):
    default_message = "Este registro foi alterado por outra operação simultânea. Tente novamente"


class UnauthorizedError(AppError):
    status_code = 401
    default_message = "Falha na autenticação"


class ForbiddenError(AppError):
    status_code = 403
    default_message = "Você não tem permissão para executar esta ação"


class TooManyRequestsError(AppError):
    status_code = 429
    default_message = "Muitas tentativas. Tente novamente em instantes"
