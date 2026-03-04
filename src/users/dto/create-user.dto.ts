import { IsString, IsNotEmpty, MinLength, IsArray, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../common/utils/roles.util';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  username: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
