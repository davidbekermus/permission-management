import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Role } from '../common/utils/roles.util';
import {
  RoleSubmission,
  RoleSubmissionDocument,
} from './schemas/role-submission.schema';
import {
  RoleSubmissionAction,
  RoleSubmissionStatus,
} from './types/role-submission.types';

interface CreateSubmissionsInput {
  username: string;
  roles: Role[];
  action: RoleSubmissionAction;
  status: RoleSubmissionStatus;
  grantedBy?: string;
  grantedAt?: Date;
}

@Injectable()
export class RoleSubmissionsRepository {
  constructor(
    @InjectModel(RoleSubmission.name)
    private readonly model: Model<RoleSubmissionDocument>,
  ) {}

  createMany(input: CreateSubmissionsInput) {
    return this.model.insertMany(
      input.roles.map((role) => ({
        username: input.username,
        role,
        action: input.action,
        status: input.status,
        grantedBy: input.grantedBy,
        grantedAt: input.grantedAt,
      })),
    );
  }

  find(filter: FilterQuery<RoleSubmissionDocument>, sortOrder: 1 | -1) {
    return this.model.find(filter).sort({ createdAt: sortOrder }).limit(20).exec();
  }

  findById(id: string) {
    return this.model.findById(id).exec();
  }

  save(submission: RoleSubmissionDocument) {
    return submission.save();
  }

  async delete(submission: RoleSubmissionDocument): Promise<void> {
    await submission.deleteOne();
  }
}
