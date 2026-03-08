import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseEnumPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminRoles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.util';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthedRequest } from '../common/interfaces/authed-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Any authenticated user — list all users.
   */
  @Get()
  findAll(
    @Query('username') username?: string,
    @Query('roles') rolesParam?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    const roles = rolesParam ? (rolesParam.split(',') as Role[]) : undefined;
    return this.usersService.findAll(username, roles, sort);
  }

  /**
   * GET /users/:username
   * Any authenticated user — fetch a single user by username.
   */
  @Get(':username')
  findByUsername(@Param('username') username: string) {
    return this.usersService.findByUsername(username);
  }

  /**
   * FLOW_ADMIN can only assign roles within their own flow.
   * ANOMALY_ADMIN can assign any roles.
   */
  @Post()
  @UseGuards(RolesGuard)
  @AdminRoles()
  create(@Body() dto: CreateUserDto, @Request() req: AuthedRequest) {
    return this.usersService.createUser(dto.username, dto.roles, req.user.roles);
  }

  /**
   * ANOMALY_ADMIN or FLOW_ADMIN — assign a role to a user.
   */
  @Patch(':username/roles')
  @UseGuards(RolesGuard)
  @AdminRoles()
  assignRole(
    @Param('username') username: string,
    @Body() dto: AssignRoleDto,
    @Request() req: AuthedRequest,
  ) {
    return this.usersService.assignRole(username, dto.role, req.user.roles);
  }

  /**
   * ANOMALY_ADMIN or FLOW_ADMIN — remove a role from a user.
   */
  @Delete(':username/roles/:role')
  @UseGuards(RolesGuard)
  @AdminRoles()
  removeRole(
    @Param('username') username: string,
    @Param('role', new ParseEnumPipe(Role)) roleToRemove: Role,
    @Request() req: AuthedRequest,
  ) {
    return this.usersService.removeRole(username, roleToRemove, req.user.roles);
  }
}
