import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';
import {
  RoleSubmission,
  RoleSubmissionSchema,
} from '../role-submissions/schemas/role-submission.schema';
import { RoleSubmissionsRepository } from '../role-submissions/role-submissions.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RoleSubmission.name, schema: RoleSubmissionSchema },
    ]),
  ],
  providers: [UsersRepository, RoleSubmissionsRepository],
  exports: [UsersRepository, RoleSubmissionsRepository],
})
export class PersistenceModule {}
