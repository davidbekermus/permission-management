import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PersistenceModule } from '../persistence/persistence.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PersistenceModule, AdminModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
