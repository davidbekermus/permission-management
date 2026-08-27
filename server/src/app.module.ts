import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoleSubmissionsModule } from './role-submissions/role-submissions.module';
import { StoreFlowModule } from './flows/store-flow.module';
import { ProductFlowModule } from './flows/product-flow.module';
import { RolesGuard } from './common/guards/roles.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    // MongoDB connection — database name is "permission-management"
    MongooseModule.forRoot(
      process.env.MONGO_URI ?? 'mongodb://localhost:27017/permission-management',
    ),

    AuthModule,
    UsersModule,
    RoleSubmissionsModule,

    // Flow modules — each declares its default roles via @FlowRoles() on
    // itself and wraps the feature module(s) that belong to that flow.
    StoreFlowModule,
    ProductFlowModule,
  ],
  providers: [
    // Applies to every route. Still relies on JwtAuthGuard (applied per-controller)
    // to populate request.user first — routes without @Roles()/@AdminRoles()/@FlowRoles()
    // metadata remain open to any authenticated user, same as before.
    // Global guards run in registration order. Decode the JWT before checking roles.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
