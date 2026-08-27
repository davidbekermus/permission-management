import { ArrayMinSize, ArrayUnique, IsArray, IsEnum, IsString, MinLength } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

export class CreateUsersDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(2, { each: true })
  usernames: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
