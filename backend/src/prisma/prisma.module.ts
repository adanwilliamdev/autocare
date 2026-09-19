import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global: evita reimportar PrismaModule em cada feature module, igual ao
// EntityManager/JpaRepository ficarem disponíveis via injeção em todo o app Spring.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
