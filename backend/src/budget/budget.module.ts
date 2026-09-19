import { Module } from "@nestjs/common";
import { BudgetService } from "./budget.service";
import { BudgetController } from "./budget.controller";
import { ClientModule } from "../client/client.module";
import { VehicleModule } from "../vehicle/vehicle.module";
import { ServiceOrderModule } from "../service-order/service-order.module";

@Module({
  imports: [ClientModule, VehicleModule, ServiceOrderModule],
  controllers: [BudgetController],
  providers: [BudgetService],
})
export class BudgetModule {}
