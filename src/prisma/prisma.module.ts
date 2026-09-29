import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()  //using global to not import prismamodule everywhere
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}