import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ServiceOrderStatus } from "@prisma/client";
import { ServiceOrderService } from "./service-order.service";
import { ServiceOrderRequestDto, StatusUpdateRequestDto } from "./dto/service-order.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";
import { AuthUser } from "../auth/jwt.strategy";

// MECHANIC só é liberado em findById/updateStatus (para ver e diagnosticar a própria
// OS); a restrição "somente a que foi atribuída a ele" é aplicada em
// ServiceOrderService#assertCanAccessOrder, pois o RolesGuard sozinho não sabe qual
// mecânico está por trás do ID da URL.
@Controller("service-orders")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST)
export class ServiceOrderController {
  constructor(private readonly serviceOrderService: ServiceOrderService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: ServiceOrderRequestDto) {
    return this.serviceOrderService.create(dto);
  }

  @Get()
  findAll() {
    return this.serviceOrderService.findAll();
  }

  @Get(":id")
  @Roles(Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST, Role.MECHANIC)
  findById(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.serviceOrderService.findByIdResponse(id, user);
  }

  @Get("client/:clientId")
  findByClient(@Param("clientId") clientId: string) {
    return this.serviceOrderService.findByClient(clientId);
  }

  @Get("vehicle/:vehicleId")
  findByVehicle(@Param("vehicleId") vehicleId: string) {
    return this.serviceOrderService.findByVehicle(vehicleId);
  }

  @Get("status/:status")
  findByStatus(@Param("status") status: ServiceOrderStatus) {
    return this.serviceOrderService.findByStatus(status);
  }

  @Patch(":id/status")
  @Roles(Role.ADMIN, Role.MANAGER, Role.MECHANIC)
  updateStatus(
    @Param("id") id: string,
    @Body() dto: StatusUpdateRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.serviceOrderService.updateStatus(id, dto, user);
  }

  @Patch(":id/mechanic")
  @Roles(Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST)
  assignMechanic(@Param("id") id: string, @Query("mechanicId") mechanicId: string) {
    return this.serviceOrderService.assignMechanic(id, mechanicId);
  }
}
