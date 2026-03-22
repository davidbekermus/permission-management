import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PermissionRequestsController } from './permission-requests.controller';
import { PermissionRequestsService } from './permission-requests.service';
import {
  PermissionRequest,
  PermissionRequestSchema,
} from './schemas/permission-request.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PermissionRequest.name, schema: PermissionRequestSchema },
    ]),
    UsersModule,
  ],
  controllers: [PermissionRequestsController],
  providers: [PermissionRequestsService],
})
export class PermissionRequestsModule {}
