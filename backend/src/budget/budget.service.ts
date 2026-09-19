import { Injectable } from "@nestjs/common";
import { BudgetStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessException, ResourceNotFoundException } from "../common/exceptions";
import { ClientService } from "../client/client.service";
import { VehicleService } from "../vehicle/vehicle.service";
import { ServiceOrderService } from "../service-order/service-order.service";
import { BudgetRequestDto } from "./dto/budget.dto";

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private serviceOrderService: ServiceOrderService,
  ) {}

  async create(dto: BudgetRequestDto) {
    const client = await this.clientService.findById(dto.clientId);
    const vehicle = await this.vehicleService.findById(dto.vehicleId);
    if (dto.serviceOrderId) {
      await this.serviceOrderService.findById(dto.serviceOrderId);
    }

    const budgetNumber = await this.generateBudgetNumber();

    const budget = await this.prisma.budget.create({
      data: {
        budgetNumber,
        clientId: client.id,
        vehicleId: vehicle.id,
        serviceOrderId: dto.serviceOrderId,
        description: dto.description,
        totalAmount: dto.totalAmount,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : undefined,
        status: BudgetStatus.PENDENTE,
      },
      include: { client: true, vehicle: true },
    });
    return this.toResponse(budget);
  }

  async approve(id: string) {
    const budget = await this.findById(id);
    if (budget.status !== BudgetStatus.PENDENTE) {
      throw new BusinessException("Apenas orçamentos pendentes podem ser aprovados");
    }
    const updated = await this.prisma.budget.update({
      where: { id },
      data: { status: BudgetStatus.APROVADO },
      include: { client: true, vehicle: true },
    });
    return this.toResponse(updated);
  }

  async reject(id: string) {
    const budget = await this.findById(id);
    if (budget.status !== BudgetStatus.PENDENTE) {
      throw new BusinessException("Apenas orçamentos pendentes podem ser recusados");
    }
    const updated = await this.prisma.budget.update({
      where: { id },
      data: { status: BudgetStatus.RECUSADO },
      include: { client: true, vehicle: true },
    });
    return this.toResponse(updated);
  }

  async findByIdResponse(id: string) {
    return this.toResponse(await this.findByIdWithRelations(id));
  }

  async findAll() {
    const budgets = await this.prisma.budget.findMany({
      include: { client: true, vehicle: true },
      orderBy: { createdAt: "desc" },
    });
    return budgets.map((b) => this.toResponse(b));
  }

  async findByClient(clientId: string) {
    const budgets = await this.prisma.budget.findMany({
      where: { clientId },
      include: { client: true, vehicle: true },
    });
    return budgets.map((b) => this.toResponse(b));
  }

  async findByStatus(status: BudgetStatus) {
    const budgets = await this.prisma.budget.findMany({
      where: { status },
      include: { client: true, vehicle: true },
    });
    return budgets.map((b) => this.toResponse(b));
  }

  private async findById(id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) {
      throw new ResourceNotFoundException(`Orçamento não encontrado com ID: ${id}`);
    }
    return budget;
  }

  private async findByIdWithRelations(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      include: { client: true, vehicle: true },
    });
    if (!budget) {
      throw new ResourceNotFoundException(`Orçamento não encontrado com ID: ${id}`);
    }
    return budget;
  }

  // Mesma estratégia de contador atômico usada em ServiceOrderService.
  private async generateBudgetNumber(): Promise<string> {
    const counter = await this.prisma.counter.upsert({
      where: { name: "budget" },
      update: { value: { increment: 1 } },
      create: { name: "budget", value: 1 },
    });
    const year = new Date().getFullYear();
    const sequence = String(counter.value).padStart(6, "0");
    return `BUD${year}${sequence}`;
  }

  private toResponse(budget: any) {
    return {
      id: budget.id,
      budgetNumber: budget.budgetNumber,
      clientId: budget.clientId,
      clientName: budget.client?.name,
      vehicleId: budget.vehicleId,
      vehicleInfo: budget.vehicle ? `${budget.vehicle.brand} ${budget.vehicle.model} (${budget.vehicle.plate})` : undefined,
      serviceOrderId: budget.serviceOrderId,
      description: budget.description,
      totalAmount: budget.totalAmount,
      status: budget.status,
      validUntil: budget.validUntil,
      createdAt: budget.createdAt,
    };
  }
}
