import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { VehicleService } from "./vehicle.service";
import { VehicleRequestDto } from "./dto/vehicle.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "@prisma/client";

@Controller("vehicles")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.RECEPTIONIST, Role.MANAGER, Role.MECHANIC)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: VehicleRequestDto) {
    return this.vehicleService.create(dto);
  }

  @Get()
  findAll() {
    return this.vehicleService.findAll();
  }

  @Get("client/:clientId")
  findByClient(@Param("clientId") clientId: string) {
    return this.vehicleService.findByClient(clientId);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.vehicleService.findByIdResponse(id);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  update(@Param("id") id: string, @Body() dto: VehicleRequestDto) {
    return this.vehicleService.update(id, dto);
  }

  @Patch(":id/mileage")
  @Roles(Role.ADMIN, Role.RECEPTIONIST, Role.MECHANIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMileage(@Param("id") id: string, @Query("mileage", ParseIntPipe) mileage: number) {
    await this.vehicleService.updateMileage(id, mileage);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    await this.vehicleService.delete(id);
  }
}
