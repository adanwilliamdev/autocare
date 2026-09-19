import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessException, ResourceNotFoundException } from "../common/exceptions";
import { ClientService } from "../client/client.service";
import { VehicleRequestDto } from "./dto/vehicle.dto";

@Injectable()
export class VehicleService {
  constructor(
    private prisma: PrismaService,
    private clientService: ClientService,
  ) {}

  async create(dto: VehicleRequestDto) {
    const plate = dto.plate.toUpperCase();
    const existing = await this.prisma.vehicle.findUnique({ where: { plate } });
    if (existing) {
      throw new BusinessException(`Já existe um veículo com esta placa: ${dto.plate}`);
    }
    const client = await this.clientService.findById(dto.clientId);

    const vehicle = await this.prisma.vehicle.create({
      data: {
        plate,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        mileage: dto.mileage,
        fuelType: dto.fuelType,
        clientId: client.id,
        isActive: true,
      },
      include: { client: true },
    });
    return this.toResponse(vehicle);
  }

  async update(id: string, dto: VehicleRequestDto) {
    const vehicle = await this.findById(id);
    const plate = dto.plate.toUpperCase();

    if (vehicle.plate !== plate) {
      const existing = await this.prisma.vehicle.findUnique({ where: { plate } });
      if (existing) {
        throw new BusinessException(`Já existe um veículo com esta placa: ${dto.plate}`);
      }
    }

    if (vehicle.clientId !== dto.clientId) {
      await this.clientService.findById(dto.clientId);
    }

    const updated = await this.prisma.vehicle.update({
      where: { id },
      data: {
        plate,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        mileage: dto.mileage,
        fuelType: dto.fuelType,
        clientId: dto.clientId,
      },
      include: { client: true },
    });
    return this.toResponse(updated);
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.vehicle.update({ where: { id }, data: { isActive: false } });
  }

  async updateMileage(id: string, mileage: number) {
    await this.findById(id);
    await this.prisma.vehicle.update({ where: { id }, data: { mileage } });
  }

  async findByIdResponse(id: string) {
    return this.toResponse(await this.findByIdWithClient(id));
  }

  async findAll() {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { isActive: true },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
    return vehicles.map((v) => this.toResponse(v));
  }

  async findByClient(clientId: string) {
    await this.clientService.findById(clientId);
    const vehicles = await this.prisma.vehicle.findMany({
      where: { clientId, isActive: true },
      include: { client: true },
    });
    return vehicles.map((v) => this.toResponse(v));
  }

  // Retorna a entidade crua — usado internamente por BudgetService/ServiceOrderService.
  async findById(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) {
      throw new ResourceNotFoundException(`Veículo não encontrado com ID: ${id}`);
    }
    return vehicle;
  }

  private async findByIdWithClient(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!vehicle) {
      throw new ResourceNotFoundException(`Veículo não encontrado com ID: ${id}`);
    }
    return vehicle;
  }

  private toResponse(vehicle: any) {
    return {
      id: vehicle.id,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      clientId: vehicle.clientId,
      clientName: vehicle.client?.name,
      createdAt: vehicle.createdAt,
      isActive: vehicle.isActive,
    };
  }
}
