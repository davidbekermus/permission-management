import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/utils/roles.util';
import { RoleSubmissionStatus } from '../types/role-submission.types';

export type RoleSubmissionDocument = RoleSubmission & Document;

@Schema({ timestamps: true })
export class RoleSubmission {
  /**
   * Username is intentionally not a DB reference.
   * This allows submissions to exist before a user document is created.
   */
  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ type: String, enum: Object.values(Role), required: true })
  role: Role;

  @Prop({
    type: String,
    enum: Object.values(RoleSubmissionStatus),
    default: RoleSubmissionStatus.PENDING,
    required: true,
  })
  status: RoleSubmissionStatus;

  @Prop({ type: String, default: null })
  grantedBy?: string | null;

  @Prop({ type: Date, default: null })
  grantedAt?: Date | null;
}

export const RoleSubmissionSchema = SchemaFactory.createForClass(RoleSubmission);
