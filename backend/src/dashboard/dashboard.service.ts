import { Injectable } from "@nestjs/common";
import { ServiceOrderStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalClients, totalVehicles, totalServiceOrders, openServiceOrders, inProgressServiceOrders, waitingApproval, allActiveParts] =
      await Promise.all([
        this.prisma.client.count(),
        this.prisma.vehicle.count(),
        this.prisma.serviceOrder.count(),
        this.prisma.serviceOrder.count({
          where: { status: { in: [ServiceOrderStatus.CRIADA, ServiceOrderStatus.EM_DIAGNOSTICO] } },
        }),
        this.prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.EM_EXECUCAO } }),
        this.prisma.serviceOrder.count({ where: { status: ServiceOrderStatus.AGUARDANDO_APROVACAO } }),
        this.prisma.part.findMany({ where: { isActive: true } }),
      ]);

    const lowStockItems = allActiveParts.filter((p) => p.stockQuantity <= p.minimumStock).length;

    return {
      totalClients,
      totalVehicles,
      totalServiceOrders,
      openServiceOrders,
      inProgressServiceOrders,
      waitingApprovalServiceOrders: waitingApproval,
      // Implementação simplificada — mesmos valores estáticos do DashboardService.java original.
      monthlyRevenue: 32450.0,
      lowStockItems,
      monthlyRevenueChart: this.getMonthlyRevenueChart(),
      topMechanics: this.getTopMechanics(),
      mostUsedParts: this.getMostUsedParts(),
    };
  }

  private getMonthlyRevenueChart() {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    const values = [8500, 9200, 7800, 11200, 9800, 13450];
    return months.map((month, i) => ({ month, amount: values[i] }));
  }

  private getTopMechanics() {
    return [
      { mechanicId: "1", mechanicName: "João Silva", completedOrders: 45 },
      { mechanicId: "2", mechanicName: "Maria Santos", completedOrders: 38 },
    ];
  }

  private getMostUsedParts() {
    return [
      { partId: "1", partName: "Filtro de Óleo", usageCount: 120 },
      { partId: "2", partName: "Pastilha de Freio", usageCount: 85 },
    ];
  }
}
