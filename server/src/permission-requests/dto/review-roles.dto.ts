import { IsArray, IsEnum, ArrayMinSize, ArrayUnique } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

/**
 * DTO for approving or rejecting specific roles within a permission request.
 * The reviewer selects which roles to act on — others remain unchanged.
 */
export class ReviewRolesDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one role must be specified' })
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
