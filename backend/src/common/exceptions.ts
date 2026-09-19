import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Equivalente a com.autocare.shared.exception.BusinessException do backend original:
 * erro de regra de negócio -> HTTP 400.
 */
export class BusinessException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/** Equivalente a InsufficientStockException (subclasse de BusinessException). */
export class InsufficientStockException extends BusinessException {
  constructor(message: string) {
    super(message);
  }
}

/** Equivalente a ResourceNotFoundException -> HTTP 404. */
export class ResourceNotFoundException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/** Usada quando um registro foi alterado por outra operação concorrente (lock otimista). */
export class OptimisticLockException extends HttpException {
  constructor(message = 'Este registro foi alterado por outra operação simultânea. Tente novamente') {
    super(message, HttpStatus.CONFLICT);
  }
}
