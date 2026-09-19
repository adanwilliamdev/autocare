import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { ClientModule } from "./client/client.module";
import { VehicleModule } from "./vehicle/vehicle.module";
import { MechanicModule } from "./mechanic/mechanic.module";
import { InventoryModule } from "./inventory/inventory.module";
import { ServiceOrderModule } from "./service-order/service-order.module";
import { BudgetModule } from "./budget/budget.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ClientModule,
    VehicleModule,
    MechanicModule,
    InventoryModule,
    ServiceOrderModule,
    BudgetModule,
    DashboardModule,
  ],
  providers: [
    // JwtAuthGuard global: equivalente a .anyRequest().authenticated() do
    // SecurityConfig.java original. Rotas marcadas @Public() ficam isentas
    // (checado dentro do próprio guard via reflector).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    },
  ],
})
export class AppModule {}
