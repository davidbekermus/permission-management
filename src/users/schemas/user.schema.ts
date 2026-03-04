import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/utils/roles.util';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  /**
   * Array of roles assigned to the user.
   * Default is empty — a user with no roles can still log in and request
   * roles via the permission-request flow.
   */
  @Prop({
    type: [String],
    enum: Object.values(Role),
    default: [],
  })
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
