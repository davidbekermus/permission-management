import { IsString, IsNotEmpty, MinLength, IsArray, IsEnum, ArrayMinSize } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  username: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(Role, { each: true })
  roles: Role[];
}
