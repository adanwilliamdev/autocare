import { Injectable } from "@nestjs/common";
import { Prisma, MovementType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessException, InsufficientStockException, OptimisticLockException, ResourceNotFoundException } from "../common/exceptions";
import { PartRequestDto } from "./dto/part.dto";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async createPart(dto: PartRequestDto) {
    const existing = await this.prisma.part.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new BusinessException(`Já existe uma peça com este código: ${dto.code}`);
    }

    const part = await this.prisma.$transaction(async (tx) => {
      const created = await tx.part.create({
        data: {
          name: dto.name,
          code: dto.code,
          manufacturer: dto.manufacturer,
          purchasePrice: dto.purchasePrice,
          salePrice: dto.salePrice,
          stockQuantity: dto.stockQuantity,
          minimumStock: dto.minimumStock ?? 5,
          isActive: true,
        },
      });
      await tx.inventoryMovement.create({
        data: {
          partId: created.id,
          type: MovementType.ENTRADA,
          quantity: dto.stockQuantity,
          previousQuantity: 0,
          currentQuantity: dto.stockQuantity,
          reason: "Cadastro inicial",
          userId: "system",
        },
      });
      return created;
    });

    return this.toResponse(part);
  }

  async updatePart(id: string, dto: PartRequestDto) {
    const part = await this.findPartById(id);

    if (part.code !== dto.code) {
      const existing = await this.prisma.part.findUnique({ where: { code: dto.code } });
      if (existing) {
        throw new BusinessException(`Já existe uma peça com este código: ${dto.code}`);
      }
    }

    const updated = await this.prisma.part.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        manufacturer: dto.manufacturer,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        minimumStock: dto.minimumStock ?? 5,
      },
    });
    return this.toResponse(updated);
  }

  async deletePart(id: string) {
    await this.findPartById(id);
    await this.prisma.part.update({ where: { id }, data: { isActive: false } });
  }

  async addStock(partId: string, quantity: number, reason: string, userId: string) {
    if (quantity <= 0) {
      throw new BusinessException("Quantidade deve ser positiva");
    }
    await this.applyMovement(partId, quantity, reason, userId, MovementType.ENTRADA);
  }

  async removeStock(partId: string, quantity: number, reason: string, userId: string) {
    if (quantity <= 0) {
      throw new BusinessException("Quantidade deve ser positiva");
    }
    await this.applyMovement(partId, -quantity, reason, userId, MovementType.SAIDA);
  }

  // Lock otimista: lê a versão atual e condiciona o UPDATE a ela (where: { id, version }).
  // Se 0 linhas forem afetadas, outra transação já alterou a peça no meio do caminho —
  // equivalente ao OptimisticLockException que o Hibernate lançava no backend original
  // graças ao @Version em Part.java.
  private async applyMovement(
    partId: string,
    delta: number,
    reason: string,
    userId: string,
    type: MovementType,
  ) {
    const part = await this.findPartById(partId);
    const newQuantity = part.stockQuantity + delta;

    if (newQuantity < 0) {
      throw new InsufficientStockException(`Estoque insuficiente. Disponível: ${part.stockQuantity}`);
    }

    await this.prisma.$transaction(async (tx) => {
      const result = await tx.part.updateMany({
        where: { id: partId, version: part.version },
        data: { stockQuantity: newQuantity, version: { increment: 1 } },
      });
      if (result.count === 0) {
        throw new OptimisticLockException();
      }
      await tx.inventoryMovement.create({
        data: {
          partId,
          type,
          quantity: Math.abs(delta),
          previousQuantity: part.stockQuantity,
          currentQuantity: newQuantity,
          reason,
          userId,
        },
      });
    });
  }

  async getPartMovements(partId: string) {
    await this.findPartById(partId);
    const movements = await this.prisma.inventoryMovement.findMany({
      where: { partId },
      include: { part: true },
      orderBy: { createdAt: "desc" },
    });
    return movements.map((m) => this.toMovementResponse(m));
  }

  async findPartByIdResponse(id: string) {
    return this.toResponse(await this.findPartById(id));
  }

  async findAllParts() {
    const parts = await this.prisma.part.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return parts.map((p) => this.toResponse(p));
  }

  async findLowStockParts() {
    const parts = await this.prisma.part.findMany({ where: { isActive: true } });
    return parts.filter((p) => p.stockQuantity <= p.minimumStock).map((p) => this.toResponse(p));
  }

  async findPartById(id: string) {
    const part = await this.prisma.part.findUnique({ where: { id } });
    if (!part) {
      throw new ResourceNotFoundException(`Peça não encontrada com ID: ${id}`);
    }
    return part;
  }

  private toResponse(part: any) {
    return {
      id: part.id,
      name: part.name,
      code: part.code,
      manufacturer: part.manufacturer,
      purchasePrice: part.purchasePrice,
      salePrice: part.salePrice,
      stockQuantity: part.stockQuantity,
      minimumStock: part.minimumStock,
      isLowStock: part.stockQuantity <= part.minimumStock,
      createdAt: part.createdAt,
      isActive: part.isActive,
    };
  }

  private toMovementResponse(movement: any) {
    return {
      id: movement.id,
      partId: movement.partId,
      partName: movement.part?.name,
      type: movement.type,
      quantity: movement.quantity,
      previousQuantity: movement.previousQuantity,
      currentQuantity: movement.currentQuantity,
      reason: movement.reason,
      referenceId: movement.referenceId,
      userId: movement.userId,
      createdAt: movement.createdAt,
    };
  }
}
