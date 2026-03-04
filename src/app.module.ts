import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PermissionRequestsModule } from './permission-requests/permission-requests.module';
import { StoreManagementModule } from './store-management/store-management.module';
import { ProductManagementModule } from './product-management/product-management.module';

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
})
export class AppModule {}
