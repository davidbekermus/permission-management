import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleSubmissionsController } from './role-submissions.controller';
import { RoleSubmissionsService } from './role-submissions.service';
import {
  RoleSubmission,
  RoleSubmissionSchema,
} from './schemas/role-submission.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoleSubmission.name, schema: RoleSubmissionSchema },
    ]),
    UsersModule,
  ],
  controllers: [RoleSubmissionsController],
  providers: [RoleSubmissionsService],
})
export class RoleSubmissionsModule {}
