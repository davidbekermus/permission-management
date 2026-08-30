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
import { AdminRoles, Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.util';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUsersDto } from './dto/create-users.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthedRequest } from '../common/interfaces/authed-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Admins only. Flow admins receive users belonging to their own flows.
   */
  @Get()
  @AdminRoles()
  findAll(
    @Request() req: AuthedRequest,
    @Query('username') username?: string,
    @Query('roles') rolesParam?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    const roles = rolesParam ? (rolesParam.split(',') as Role[]) : undefined;
    return this.usersService.findAll(req.user.roles, username, roles, sort);
  }

  /**
   * GET /users/:username
   * Admins only. Flow admins may fetch users belonging to their own flows.
   */
  @Get(':username')
  @AdminRoles()
  findByUsername(@Param('username') username: string, @Request() req: AuthedRequest) {
    return this.usersService.findByUsername(username, req.user.roles);
  }

  /**
   * ANOMALY_ADMIN only.
   */
  @Post()
  @Roles(Role.ANOMALY_ADMIN)
  create(@Body() dto: CreateUserDto, @Request() req: AuthedRequest) {
    return this.usersService.createUser(dto.username, dto.roles, req.user.roles, req.user.username);
  }

  @Post('bulk')
  @Roles(Role.ANOMALY_ADMIN)
  createMany(@Body() dto: CreateUsersDto, @Request() req: AuthedRequest) {
    return this.usersService.createUsers(dto.usernames, dto.roles, req.user.roles, req.user.username);
  }

  /**
   * ANOMALY_ADMIN only — assign a role to a user.
   */
  @Patch(':username/roles')
  @Roles(Role.ANOMALY_ADMIN)
  assignRole(
    @Param('username') username: string,
    @Body() dto: AssignRoleDto,
    @Request() req: AuthedRequest,
  ) {
    return this.usersService.assignRole(username, dto.role, req.user.roles, req.user.username);
  }

  /**
   * ANOMALY_ADMIN only — remove a role from a user.
   */
  @Delete(':username/roles/:role')
  @Roles(Role.ANOMALY_ADMIN)
  removeRole(
    @Param('username') username: string,
    @Param('role', new ParseEnumPipe(Role)) roleToRemove: Role,
    @Request() req: AuthedRequest,
  ) {
    return this.usersService.removeRole(username, roleToRemove, req.user.roles, req.user.username);
  }
}
