import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import {
  RoleSubmission,
  RoleSubmissionSchema,
} from '../role-submissions/schemas/role-submission.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RoleSubmission.name, schema: RoleSubmissionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  // Export UsersService so AuthModule and RoleSubmissionsModule can inject it
  exports: [UsersService],
})
export class UsersModule {}
