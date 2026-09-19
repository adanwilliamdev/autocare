import { Module } from "@nestjs/common";
import { VehicleService } from "./vehicle.service";
import { VehicleController } from "./vehicle.controller";
import { ClientModule } from "../client/client.module";

@Module({
  imports: [ClientModule],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
