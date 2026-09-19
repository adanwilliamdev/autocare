import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessException, ResourceNotFoundException } from "../common/exceptions";
import { MechanicRequestDto } from "./dto/mechanic.dto";

@Injectable()
export class MechanicService {
  constructor(private prisma: PrismaService) {}

  async create(dto: MechanicRequestDto) {
    if (dto.userId) {
      const linked = await this.prisma.mechanic.findUnique({ where: { userId: dto.userId } });
      if (linked) {
        throw new BusinessException("Este usuário já está vinculado a outro perfil de mecânico");
      }
    }

    const mechanic = await this.prisma.mechanic.create({
      data: {
        name: dto.name,
        specialty: dto.specialty,
        phone: dto.phone,
        userId: dto.userId,
        isAvailable: true,
        isActive: true,
      },
    });
    return this.toResponse(mechanic);
  }

  async update(id: string, dto: MechanicRequestDto) {
    const mechanic = await this.findById(id);

    if (dto.userId && dto.userId !== mechanic.userId) {
      const linked = await this.prisma.mechanic.findUnique({ where: { userId: dto.userId } });
      if (linked) {
        throw new BusinessException("Este usuário já está vinculado a outro perfil de mecânico");
      }
    }

    const updated = await this.prisma.mechanic.update({
      where: { id },
      data: { name: dto.name, specialty: dto.specialty, phone: dto.phone, userId: dto.userId },
    });
    return this.toResponse(updated);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.mechanic.update({ where: { id }, data: { isActive: false } });
  }

  async setAvailability(id: string, available: boolean) {
    await this.findById(id);
    await this.prisma.mechanic.update({ where: { id }, data: { isAvailable: available } });
  }

  async findByIdResponse(id: string) {
    return this.toResponse(await this.findById(id));
  }

  async findAll() {
    const mechanics = await this.prisma.mechanic.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return mechanics.map((m) => this.toResponse(m));
  }

  async findAvailable() {
    const mechanics = await this.prisma.mechanic.findMany({
      where: { isAvailable: true, isActive: true },
    });
    return mechanics.map((m) => this.toResponse(m));
  }

  // Retorna a entidade crua — usado internamente por ServiceOrderService/BudgetService.
  async findById(id: string) {
    const mechanic = await this.prisma.mechanic.findUnique({ where: { id } });
    if (!mechanic) {
      throw new ResourceNotFoundException(`Mecânico não encontrado com ID: ${id}`);
    }
    return mechanic;
  }

  async findByUserId(userId: string) {
    return this.prisma.mechanic.findUnique({ where: { userId } });
  }

  private toResponse(mechanic: any) {
    return {
      id: mechanic.id,
      name: mechanic.name,
      specialty: mechanic.specialty,
      phone: mechanic.phone,
      isAvailable: mechanic.isAvailable,
      createdAt: mechanic.createdAt,
      isActive: mechanic.isActive,
    };
  }
}
