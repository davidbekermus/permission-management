import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { AdminService } from './admin.service';

@Module({
  imports: [PersistenceModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
