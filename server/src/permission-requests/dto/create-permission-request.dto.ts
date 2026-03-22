import { IsArray, IsEnum, ArrayMinSize, ArrayUnique, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

export class CreatePermissionRequestDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be requested' })
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
