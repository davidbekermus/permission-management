import { IsArray, IsEnum, ArrayMinSize, ArrayUnique } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

export class CreatePermissionRequestDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be requested' })
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
