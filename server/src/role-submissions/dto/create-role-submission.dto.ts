import { IsArray, IsEnum, ArrayMinSize, ArrayUnique, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/utils/roles.util';
import { RoleSubmissionAction } from '../types/role-submission.types';

export class CreateRoleSubmissionDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be submitted' })
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsEnum(RoleSubmissionAction)
  action: RoleSubmissionAction;
}
