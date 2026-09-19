import { Controller, Get, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "@prisma/client";

@Controller("dashboard")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  getStats() {
    return this.dashboardService.getDashboardStats();
  }
}
