import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ResourceNotFoundException } from "../common/exceptions";
import { ClientRequestDto } from "./dto/client.dto";

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async create(dto: ClientRequestDto) {
    const client = await this.prisma.client.create({
      data: { ...dto, isActive: true },
      include: { vehicles: true },
    });
    return this.toResponse(client);
  }

  async update(id: string, dto: ClientRequestDto) {
    await this.findById(id);
    const client = await this.prisma.client.update({
      where: { id },
      data: dto,
      include: { vehicles: true },
    });
    return this.toResponse(client);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.client.update({ where: { id }, data: { isActive: false } });
  }

  async activate(id: string) {
    await this.findById(id);
    await this.prisma.client.update({ where: { id }, data: { isActive: true } });
  }

  async findByIdResponse(id: string) {
    return this.toResponse(await this.findByIdWithVehicles(id));
  }

  async findAll() {
    const clients = await this.prisma.client.findMany({
      where: { isActive: true },
      include: { vehicles: true },
      orderBy: { createdAt: "desc" },
    });
    return clients.map((c) => this.toResponse(c));
  }

  async searchByName(name: string) {
    const clients = await this.prisma.client.findMany({
      where: { name: { contains: name, mode: "insensitive" } },
      include: { vehicles: true },
    });
    return clients.map((c) => this.toResponse(c));
  }

  // Equivalente a ClientService.findById do backend original: retorna a entidade
  // crua (não o DTO de resposta), usado internamente por outros services
  // (VehicleService, ServiceOrderService, BudgetService).
  async findById(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new ResourceNotFoundException(`Cliente não encontrado com ID: ${id}`);
    }
    return client;
  }

  private async findByIdWithVehicles(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: { vehicles: true },
    });
    if (!client) {
      throw new ResourceNotFoundException(`Cliente não encontrado com ID: ${id}`);
    }
    return client;
  }

  private toResponse(client: any) {
    return {
      id: client.id,
      name: client.name,
      cpf: client.cpf,
      phone: client.phone,
      email: client.email,
      address: client.address,
      createdAt: client.createdAt,
      isActive: client.isActive,
      vehicleCount: client.vehicles ? client.vehicles.length : 0,
    };
  }
}
