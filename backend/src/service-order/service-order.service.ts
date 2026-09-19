import { ForbiddenException, Injectable } from "@nestjs/common";
import { Role, ServiceOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BusinessException, ResourceNotFoundException } from "../common/exceptions";
import { ClientService } from "../client/client.service";
import { VehicleService } from "../vehicle/vehicle.service";
import { MechanicService } from "../mechanic/mechanic.service";
import { ServiceOrderRequestDto, StatusUpdateRequestDto } from "./dto/service-order.dto";
import { AuthUser } from "../auth/jwt.strategy";

// Espelha ServiceOrderService.validateStatusTransition do backend original.
const VALID_TRANSITIONS: Record<ServiceOrderStatus, ServiceOrderStatus[]> = {
  CRIADA: [ServiceOrderStatus.EM_DIAGNOSTICO, ServiceOrderStatus.CANCELADA],
  EM_DIAGNOSTICO: [ServiceOrderStatus.AGUARDANDO_APROVACAO, ServiceOrderStatus.CANCELADA],
  AGUARDANDO_APROVACAO: [ServiceOrderStatus.APROVADA, ServiceOrderStatus.CANCELADA],
  APROVADA: [ServiceOrderStatus.EM_EXECUCAO, ServiceOrderStatus.CANCELADA],
  EM_EXECUCAO: [ServiceOrderStatus.FINALIZADA, ServiceOrderStatus.CANCELADA],
  FINALIZADA: [],
  CANCELADA: [],
};

@Injectable()
export class ServiceOrderService {
  constructor(
    private prisma: PrismaService,
    private clientService: ClientService,
    private vehicleService: VehicleService,
    private mechanicService: MechanicService,
  ) {}

  async create(dto: ServiceOrderRequestDto) {
    const client = await this.clientService.findById(dto.clientId);
    const vehicle = await this.vehicleService.findById(dto.vehicleId);
    if (dto.mechanicId) {
      await this.mechanicService.findById(dto.mechanicId);
    }

    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.serviceOrder.create({
      data: {
        orderNumber,
        clientId: client.id,
        vehicleId: vehicle.id,
        mechanicId: dto.mechanicId,
        reportedProblem: dto.reportedProblem,
        status: ServiceOrderStatus.CRIADA,
        totalAmount: 0,
      },
      include: { client: true, vehicle: true, mechanic: true },
    });
    return this.toResponse(order);
  }

  async updateStatus(id: string, dto: StatusUpdateRequestDto, currentUser: AuthUser) {
    const order = await this.findByIdWithRelations(id);
    await this.assertCanAccessOrder(order, currentUser);

    this.validateStatusTransition(order.status, dto.status);

    const data: any = { status: dto.status };
    if (dto.diagnosis != null) {
      data.diagnosis = dto.diagnosis;
    }
    if (dto.status === ServiceOrderStatus.EM_EXECUCAO) {
      data.startedAt = new Date();
    }
    if (dto.status === ServiceOrderStatus.FINALIZADA) {
      data.completedAt = new Date();
    }

    const updated = await this.prisma.serviceOrder.update({
      where: { id },
      data,
      include: { client: true, vehicle: true, mechanic: true },
    });
    return this.toResponse(updated);
  }

  async assignMechanic(id: string, mechanicId: string) {
    await this.findById(id);
    await this.mechanicService.findById(mechanicId);

    const updated = await this.prisma.serviceOrder.update({
      where: { id },
      data: { mechanicId },
      include: { client: true, vehicle: true, mechanic: true },
    });
    return this.toResponse(updated);
  }

  async findByIdResponse(id: string, currentUser: AuthUser) {
    const order = await this.findByIdWithRelations(id);
    await this.assertCanAccessOrder(order, currentUser);
    return this.toResponse(order);
  }

  async findAll() {
    const orders = await this.prisma.serviceOrder.findMany({
      include: { client: true, vehicle: true, mechanic: true },
      orderBy: { createdAt: "desc" },
    });
    return orders.map((o) => this.toResponse(o));
  }

  async findByClient(clientId: string) {
    const orders = await this.prisma.serviceOrder.findMany({
      where: { clientId },
      include: { client: true, vehicle: true, mechanic: true },
    });
    return orders.map((o) => this.toResponse(o));
  }

  async findByVehicle(vehicleId: string) {
    const orders = await this.prisma.serviceOrder.findMany({
      where: { vehicleId },
      include: { client: true, vehicle: true, mechanic: true },
    });
    return orders.map((o) => this.toResponse(o));
  }

  async findByStatus(status: ServiceOrderStatus) {
    const orders = await this.prisma.serviceOrder.findMany({
      where: { status },
      include: { client: true, vehicle: true, mechanic: true },
    });
    return orders.map((o) => this.toResponse(o));
  }

  // Retorna a entidade crua — usado internamente por BudgetService.
  async findById(id: string) {
    const order = await this.prisma.serviceOrder.findUnique({ where: { id } });
    if (!order) {
      throw new ResourceNotFoundException(`Ordem de serviço não encontrada com ID: ${id}`);
    }
    return order;
  }

  private async findByIdWithRelations(id: string) {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: { client: true, vehicle: true, mechanic: true },
    });
    if (!order) {
      throw new ResourceNotFoundException(`Ordem de serviço não encontrada com ID: ${id}`);
    }
    return order;
  }

  // Restringe o acesso de um usuário MECHANIC apenas às ordens de serviço que lhe
  // foram atribuídas — o controller libera a rota para o papel MECHANIC (ele precisa
  // ver e diagnosticar suas OS), mas sem esta checagem qualquer mecânico logado
  // conseguiria ler ou alterar a OS de qualquer colega. Outros papéis não passam por
  // essa restrição adicional.
  private async assertCanAccessOrder(order: { mechanicId: string | null }, currentUser: AuthUser) {
    if (currentUser.role !== Role.MECHANIC) {
      return;
    }

    const mechanic = await this.mechanicService.findByUserId(currentUser.id);
    if (!mechanic) {
      throw new ForbiddenException("Usuário não possui um perfil de mecânico vinculado");
    }

    const isAssigned = order.mechanicId != null && order.mechanicId === mechanic.id;
    if (!isAssigned) {
      throw new ForbiddenException("Esta ordem de serviço não está atribuída a você");
    }
  }

  private validateStatusTransition(current: ServiceOrderStatus, next: ServiceOrderStatus) {
    if (current === next) {
      return;
    }
    const allowed = VALID_TRANSITIONS[current] ?? [];
    if (!allowed.includes(next)) {
      throw new BusinessException(`Transição de status inválida de ${current} para ${next}`);
    }
  }

  // Usa um contador atômico (tabela Counter, incrementado dentro de uma transação)
  // em vez de "count() + 1": count()+1 não é atômico, então duas OS criadas ao mesmo
  // tempo podiam calcular o mesmo próximo número. O UPDATE...increment é garantido
  // atômico pelo Postgres mesmo sob concorrência — mesma garantia que o nextval()
  // da sequence usada no backend original.
  private async generateOrderNumber(): Promise<string> {
    const counter = await this.prisma.counter.upsert({
      where: { name: "service_order" },
      update: { value: { increment: 1 } },
      create: { name: "service_order", value: 1 },
    });
    const year = new Date().getFullYear();
    const sequence = String(counter.value).padStart(6, "0");
    return `OS${year}${sequence}`;
  }

  private toResponse(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      clientId: order.clientId,
      clientName: order.client?.name,
      vehicleId: order.vehicleId,
      vehicleInfo: order.vehicle ? `${order.vehicle.brand} ${order.vehicle.model} (${order.vehicle.plate})` : undefined,
      mechanicId: order.mechanicId,
      mechanicName: order.mechanic?.name,
      reportedProblem: order.reportedProblem,
      diagnosis: order.diagnosis,
      status: order.status,
      totalAmount: order.totalAmount,
      startedAt: order.startedAt,
      completedAt: order.completedAt,
      createdAt: order.createdAt,
    };
  }
}
