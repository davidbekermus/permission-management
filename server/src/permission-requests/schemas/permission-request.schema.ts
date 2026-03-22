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

  @Prop({
    type: [
      {
        role: { type: String, enum: Object.values(Role), required: true },
        status: {
          type: String,
          enum: Object.values(RoleRequestStatus),
          default: RoleRequestStatus.PENDING,
        },
        reviewedBy: { type: String, default: null },
        reviewedAt: { type: Date, default: null },
      },
    ],
    required: true,
  })
  roles: RoleRequestItem[];

  @Prop({ default: () => new Date() })
  requestedAt: Date;
}

export const PermissionRequestSchema =
  SchemaFactory.createForClass(PermissionRequest);
