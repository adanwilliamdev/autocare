import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClientService } from "./client.service";
import { ClientRequestDto } from "./dto/client.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "@prisma/client";

// Leitura liberada para ADMIN, RECEPTIONIST e MANAGER (relatórios/dashboard). Escrita
// restrita a ADMIN e RECEPTIONIST — mesma regra do ClientController.java original.
@Controller("clients")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.RECEPTIONIST, Role.MANAGER)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: ClientRequestDto) {
    return this.clientService.create(dto);
  }

  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @Get("search")
  search(@Query("name") name: string) {
    return this.clientService.searchByName(name);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.clientService.findByIdResponse(id);
  }

  @Put(":id")
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  update(@Param("id") id: string, @Body() dto: ClientRequestDto) {
    return this.clientService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param("id") id: string) {
    await this.clientService.delete(id);
  }

  @Patch(":id/activate")
  @Roles(Role.ADMIN, Role.RECEPTIONIST)
  @HttpCode(HttpStatus.NO_CONTENT)
  async activate(@Param("id") id: string) {
    await this.clientService.activate(id);
  }
}
