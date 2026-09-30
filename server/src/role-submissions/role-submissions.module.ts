import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PersistenceModule } from '../persistence/persistence.module';
import { RoleSubmissionsController } from './role-submissions.controller';
import { RoleSubmissionsService } from './role-submissions.service';

@Module({
  imports: [PersistenceModule, AdminModule],
  controllers: [RoleSubmissionsController],
  providers: [RoleSubmissionsService],
})
export class RoleSubmissionsModule {}
