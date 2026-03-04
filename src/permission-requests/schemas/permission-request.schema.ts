import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/utils/roles.util';

export type PermissionRequestDocument = PermissionRequest & Document;

/** Status of a single role within a permission request. */
export type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/**
 * Compact per-role status tracker.
 * Each requested role has its own lifecycle — allows partial approvals.
 */
export class RoleRequestItem {
  role: Role;
  status: RoleRequestStatus;
}

/**
 * Computed overall status of a permission request — derived from role statuses.
 * Not stored in DB; calculated on the fly.
 */
export type OverallRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PARTIALLY_APPROVED'
  | 'REJECTED';

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
          enum: ['PENDING', 'APPROVED', 'REJECTED'],
          default: 'PENDING',
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
