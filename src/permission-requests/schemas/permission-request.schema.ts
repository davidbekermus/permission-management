import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/utils/roles.util';
import { RoleRequestItem, RoleRequestStatus } from '../types/permission-request.types';

export type PermissionRequestDocument = PermissionRequest & Document;

@Schema({ timestamps: true })
export class PermissionRequest {
  /**
   * Username of the requestor — NOT a DB reference.
   * This allows requests to exist before the user document is created.
   */
  @Prop({ required: true, trim: true })
  username: string;

  /** Each requested role with its own PENDING/APPROVED/REJECTED status. */
  @Prop({
    type: [
      {
        role: { type: String, enum: Object.values(Role), required: true },
        status: {
          type: String,
          enum: Object.values(RoleRequestStatus),
          default: RoleRequestStatus.PENDING,
        },
      },
    ],
    required: true,
  })
  roles: RoleRequestItem[];

  /** When the request was submitted. */
  @Prop({ default: () => new Date() })
  requestedAt: Date;

  /** Username of the admin who last reviewed this request. */
  @Prop({ default: null })
  reviewedBy?: string;

  /** When the last review action occurred. */
  @Prop({ default: null })
  reviewedAt?: Date;
}

export const PermissionRequestSchema =
  SchemaFactory.createForClass(PermissionRequest);
