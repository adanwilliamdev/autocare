import { Module } from "@nestjs/common";
import { MechanicService } from "./mechanic.service";
import { MechanicController } from "./mechanic.controller";

@Module({
  controllers: [MechanicController],
  providers: [MechanicService],
  exports: [MechanicService],
})
export class MechanicModule {}
