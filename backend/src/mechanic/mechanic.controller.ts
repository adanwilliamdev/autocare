import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { MechanicService } from "./mechanic.service";
import { MechanicRequestDto } from "./dto/mechanic.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "@prisma/client";

// Gestão da equipe (cadastro de mecânicos) é responsabilidade de ADMIN/MANAGER.
// Leitura é liberada também para RECEPTIONIST, que precisa consultar mecânicos
// disponíveis para atribuir a uma ordem de serviço.
@Controller("mechanics")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.RECEPTIONIST)
export class MechanicController {
  constructor(private readonly mechanicService: MechanicService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: MechanicRequestDto) {
    return this.mechanicService.create(dto);
  }

  @Get()
  findAll() {
    return this.mechanicService.findAll();
  }

  @Get("available")
  findAvailable() {
    return this.mechanicService.findAvailable();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.mechanicService.findByIdResponse(id);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param("id") id: string, @Body() dto: MechanicRequestDto) {
    return this.mechanicService.update(id, dto);
  }

  @Patch(":id/availability")
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setAvailability(@Param("id") id: string, @Query("available", ParseBoolPipe) available: boolean) {
    await this.mechanicService.setAvailability(id, available);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    await this.mechanicService.delete(id);
  }
}
