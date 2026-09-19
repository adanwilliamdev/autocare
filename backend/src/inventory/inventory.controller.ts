import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { PartRequestDto } from "./dto/part.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "@prisma/client";

// Conforme a tabela de permissões do projeto, o módulo de estoque é restrito a
// ADMIN e MANAGER (RECEPTIONIST e MECHANIC não devem criar peças ou movimentar
// estoque diretamente).
@Controller("inventory")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post("parts")
  @HttpCode(HttpStatus.CREATED)
  createPart(@Body() dto: PartRequestDto) {
    return this.inventoryService.createPart(dto);
  }

  @Get("parts")
  findAllParts() {
    return this.inventoryService.findAllParts();
  }

  @Get("parts/low-stock")
  findLowStockParts() {
    return this.inventoryService.findLowStockParts();
  }

  @Get("parts/:id")
  findPartById(@Param("id") id: string) {
    return this.inventoryService.findPartByIdResponse(id);
  }

  @Put("parts/:id")
  updatePart(@Param("id") id: string, @Body() dto: PartRequestDto) {
    return this.inventoryService.updatePart(id, dto);
  }

  @Delete("parts/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePart(@Param("id") id: string) {
    await this.inventoryService.deletePart(id);
  }

  // O userId de auditoria vem sempre do usuário autenticado (JWT via @CurrentUser),
  // nunca de um parâmetro enviado pelo cliente — antes era possível forjar esse valor
  // e registrar uma movimentação de estoque em nome de outra pessoa.
  @Post("parts/:id/add-stock")
  @HttpCode(HttpStatus.NO_CONTENT)
  async addStock(
    @Param("id") id: string,
    @Query("quantity", ParseIntPipe) quantity: number,
    @Query("reason") reason: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.inventoryService.addStock(id, quantity, reason, userId);
  }

  @Post("parts/:id/remove-stock")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeStock(
    @Param("id") id: string,
    @Query("quantity", ParseIntPipe) quantity: number,
    @Query("reason") reason: string,
    @CurrentUser("id") userId: string,
  ) {
    await this.inventoryService.removeStock(id, quantity, reason, userId);
  }

  @Get("parts/:id/movements")
  getPartMovements(@Param("id") id: string) {
    return this.inventoryService.getPartMovements(id);
  }
}
