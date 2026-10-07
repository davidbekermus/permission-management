import { Module } from '@nestjs/common';
import { ProductManagementModule } from '../product-management/product-management.module';
import { FlowRoles } from '../common/decorators/roles.decorator';

// Declares the default roles for every controller this flow owns.
// A controller can still override this with its own @Roles()/@FlowRoles().
@FlowRoles('PRODUCT')
@Module({
  imports: [ProductManagementModule],
})
export class ProductFlowModule {}
