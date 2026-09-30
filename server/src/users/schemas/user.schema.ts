import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/utils/roles.util';

export type UserDocument = User & Document;

export interface UserRoleEntry {
  role: Role;
  grantedBy: string;
  grantedAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  /**
   * Array of roles assigned to the user.
   * Each entry records who granted the role and when.
   * Default is empty — a user with no roles can still log in and request
   * roles via the role-submission flow.
   */
  @Prop({
    type: [
      {
        role: { type: String, enum: Object.values(Role), required: true },
        grantedBy: { type: String, required: true },
        grantedAt: { type: Date, default: () => new Date() },
      },
    ],
    default: [],
  })
  roles: UserRoleEntry[];
}

export const UserSchema = SchemaFactory.createForClass(User);
