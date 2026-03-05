import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, AdminRoles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.util';
import { CreateUserDto } from './dto/create-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Any authenticated user — list all users.
   */
  @Get()
  findAll() {
    return this.usersService.findAll();
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
   * POST /users
   * ANOMALY_ADMIN only — create a user directly (bypasses permission flow).
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ANOMALY_ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto.username, dto.roles ?? []);
  }

  /**
   * PATCH /users/:username/roles
   * ANOMALY_ADMIN or FLOW_ADMIN — assign a role to a user.
   * Service validates that the requester's flow matches the target role's flow.
   */
  @Patch(':username/roles')
  @UseGuards(RolesGuard)
  @AdminRoles()
  assignRole(
    @Param('username') username: string,
    @Body() dto: AssignRoleDto,
    @Request() req: any,
  ) {
    return this.usersService.assignRole(username, dto.role, req.user.roles);
  }

  /**
   * DELETE /users/:username/roles/:role
   * ANOMALY_ADMIN or FLOW_ADMIN — remove a role from a user.
   * Service validates flow scope.
   */
  @Delete(':username/roles/:role')
  @UseGuards(RolesGuard)
  @AdminRoles()
  removeRole(
    @Param('username') username: string,
    @Param('role') role: Role,
    @Request() req: any,
  ) {
    return this.usersService.removeRole(username, role, req.user.roles);
  }
}
