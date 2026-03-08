import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

export class AssignRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
