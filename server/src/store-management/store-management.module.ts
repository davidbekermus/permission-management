import { Module } from '@nestjs/common';
import { StoreManagementController } from './store-management.controller';
import { StoreManagementService } from './store-management.service';

@Module({
  controllers: [StoreManagementController],
  providers: [StoreManagementService],
})
export class StoreManagementModule {}
