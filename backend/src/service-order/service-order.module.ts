import { Module } from "@nestjs/common";
import { ServiceOrderService } from "./service-order.service";
import { ServiceOrderController } from "./service-order.controller";
import { ClientModule } from "../client/client.module";
import { VehicleModule } from "../vehicle/vehicle.module";
import { MechanicModule } from "../mechanic/mechanic.module";

@Module({
  imports: [ClientModule, VehicleModule, MechanicModule],
  controllers: [ServiceOrderController],
  providers: [ServiceOrderService],
  exports: [ServiceOrderService],
})
export class ServiceOrderModule {}
