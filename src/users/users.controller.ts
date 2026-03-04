import {
  Controller,
  Get,
  Post,
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

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * ANOMALY_ADMIN only — list all users.
   */
  @Get()
  @Roles(Role.ANOMALY_ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * POST /users
   * ANOMALY_ADMIN only — create a user directly (bypasses permission flow).
   */
  @Post()
  @Roles(Role.ANOMALY_ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto.username, dto.roles ?? []);
  }

  /**
   * POST /users/:username/roles
   * ANOMALY_ADMIN or FLOW_ADMIN — assign a role to a user.
   * Service validates that the requester's flow matches the target role's flow.
   */
  @Post(':username/roles')
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
  @AdminRoles()
  removeRole(
    @Param('username') username: string,
    @Param('role') role: Role,
    @Request() req: any,
  ) {
    return this.usersService.removeRole(username, role, req.user.roles);
  }
}
