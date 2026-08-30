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
  Query,
} from '@nestjs/common';
import { RoleSubmissionsService } from './role-submissions.service';
import { CreateRoleSubmissionDto } from './dto/create-role-submission.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdminRoles, Roles } from '../common/decorators/roles.decorator';
import { RoleSubmissionStatus } from './types/role-submission.types';
import { AuthedRequest } from '../common/interfaces/authed-request.interface';
import { Role } from '../common/utils/roles.util';

@UseGuards(JwtAuthGuard)
@Controller('role-submissions')
export class RoleSubmissionsController {
  constructor(private readonly service: RoleSubmissionsService) {}

  @Post()
  create(@Body() dto: CreateRoleSubmissionDto, @Request() req: AuthedRequest) {
    return this.service.create(req.user.username, dto);
  }

  @Get()
  @AdminRoles()
  findAll(
    @Request() req: AuthedRequest,
    @Query('statuses') statusesParam?: string,
    @Query('username') username?: string,
    @Query('roles') rolesParam?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    const statuses = statusesParam ? (statusesParam.split(',') as RoleSubmissionStatus[]) : undefined;
    const roles = rolesParam ? (rolesParam.split(',') as Role[]) : undefined;
    return this.service.findAll(req.user.roles, statuses, username, roles, sort);
  }

  @Get('my-submissions')
  findMine(
    @Request() req: AuthedRequest,
    @Query('statuses') statusesParam?: string,
    @Query('roles') rolesParam?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    const statuses = statusesParam ? (statusesParam.split(',') as RoleSubmissionStatus[]) : undefined;
    const roles = rolesParam ? (rolesParam.split(',') as Role[]) : undefined;
    return this.service.findMine(req.user.username, statuses, roles, sort);
  }

  @Get(':id')
  @AdminRoles()
  findOne(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.service.findById(id, req.user.roles);
  }

  @Patch(':id/approve')
  @Roles(Role.ANOMALY_ADMIN)
  approve(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.service.approve(id, req.user.username, req.user.roles);
  }

  @Patch(':id/reject')
  @Roles(Role.ANOMALY_ADMIN)
  reject(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.service.reject(id, req.user.username, req.user.roles);
  }

  @Delete(':id')
  deleteMine(@Param('id') id: string, @Request() req: AuthedRequest) {
    return this.service.deleteMine(id, req.user.username);
  }
}
