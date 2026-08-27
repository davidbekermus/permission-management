import { IsArray, IsEnum, ArrayMinSize, ArrayUnique, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

export class CreateRoleSubmissionDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be submitted' })
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
