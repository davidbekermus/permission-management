import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PermissionRequestsModule } from './permission-requests/permission-requests.module';
import { StoreManagementModule } from './store-management/store-management.module';
import { ProductManagementModule } from './product-management/product-management.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // MongoDB connection — database name is "permission-management"
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost:27017/permission-management',
    ),

    // Feature modules
    AuthModule,
    UsersModule,
    PermissionRequestsModule,
    StoreManagementModule,
    ProductManagementModule,
  ],
  providers: [
    // Applies to every route. Still relies on JwtAuthGuard (applied per-controller)
    // to populate request.user first — routes without @Roles()/@AdminRoles()/@FlowRoles()
    // metadata remain open to any authenticated user, same as before.
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
