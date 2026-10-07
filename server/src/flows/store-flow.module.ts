import { Module } from '@nestjs/common';
import { StoreManagementModule } from '../store-management/store-management.module';
import { FlowRoles } from '../common/decorators/roles.decorator';

// Declares the default roles for every controller this flow owns.
// A controller can still override this with its own @Roles()/@FlowRoles().
@FlowRoles('STORE')
@Module({
  imports: [StoreManagementModule],
})
export class StoreFlowModule {}
