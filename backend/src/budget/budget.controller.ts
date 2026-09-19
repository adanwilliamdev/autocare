import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { BudgetStatus } from "@prisma/client";
import { BudgetService } from "./budget.service";
import { BudgetRequestDto } from "./dto/budget.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "@prisma/client";

// Criação/consulta liberada para quem atende o cliente (ADMIN, RECEPTIONIST) e para
// MANAGER (relatórios). Aprovar/rejeitar um orçamento é uma decisão financeira e fica
// restrita a ADMIN e MANAGER.
@Controller("budgets")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.RECEPTIONIST, Role.MANAGER)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: BudgetRequestDto) {
    return this.budgetService.create(dto);
  }

  @Get()
  findAll() {
    return this.budgetService.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.budgetService.findByIdResponse(id);
  }

  @Get("client/:clientId")
  findByClient(@Param("clientId") clientId: string) {
    return this.budgetService.findByClient(clientId);
  }

  @Get("status/:status")
  findByStatus(@Param("status") status: BudgetStatus) {
    return this.budgetService.findByStatus(status);
  }

  @Patch(":id/approve")
  @Roles(Role.ADMIN, Role.MANAGER)
  approve(@Param("id") id: string) {
    return this.budgetService.approve(id);
  }

  @Patch(":id/reject")
  @Roles(Role.ADMIN, Role.MANAGER)
  reject(@Param("id") id: string) {
    return this.budgetService.reject(id);
  }
}
