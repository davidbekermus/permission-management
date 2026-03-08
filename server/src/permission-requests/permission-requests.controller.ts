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
import { PermissionRequestsService } from './permission-requests.service';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { ReviewRolesDto } from './dto/review-roles.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminRoles } from '../common/decorators/roles.decorator';
import { OverallRequestStatus } from './types/permission-request.types';
import { AuthedRequest } from '../common/interfaces/authed-request.interface';
import { Role } from '../common/utils/roles.util';

@UseGuards(JwtAuthGuard)
@Controller('permission-requests')
export class PermissionRequestsController {
  constructor(private readonly service: PermissionRequestsService) {}

  /**
   * Any authenticated user (even with zero roles) can submit a request.
   * The requester's username is taken from the JWT payload — not from the body.
   *
   * JwtAuthGuard only (no RolesGuard) so zero-role users can access this.
   */
  @Post()
  create(@Body() dto: CreatePermissionRequestDto, @Request() req: AuthedRequest) {
    return this.service.create(req.user.username, dto);
  }

  /**
   * Admin-only — list requests scoped to the requester's flow(s).
   * ANOMALY_ADMIN sees all requests (via RolesGuard bypass).
   */
  @Get()
  @UseGuards(RolesGuard)
  @AdminRoles()
  findAll(
    @Request() req: AuthedRequest,
    @Query('statuses') statusesParam?: string,
    @Query('username') username?: string,
    @Query('roles') rolesParam?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    const statuses = statusesParam ? (statusesParam.split(',') as OverallRequestStatus[]) : undefined;
    const roles = rolesParam ? (rolesParam.split(',') as Role[]) : undefined;
    return this.service.findAll(req.user.roles, statuses, username, roles, sort);
  }

  /**
   * Returns the authenticated user's own permission requests.
   * No admin access — admins use GET /permission-requests?username= instead.
   */
  @Get('my-requests')
  findMine(
    @Request() req: AuthedRequest,
    @Query('statuses') statusesParam?: string,
    @Query('roles') rolesParam?: string,
    @Query('sort') sort?: 'asc' | 'desc',
  ) {
    const statuses = statusesParam ? (statusesParam.split(',') as OverallRequestStatus[]) : undefined;
    const roles = rolesParam ? (rolesParam.split(',') as Role[]) : undefined;
    return this.service.findMine(req.user.username, statuses, roles, sort);
  }

  /**
   * All flow admins — retrieve a single request by its MongoDB ID.
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @AdminRoles()
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /**
   * Add new roles to an existing permission request.
   * Only the request owner can call this — ownership is enforced in the service.
   */
  @Patch(':id/roles')
  addRoles(
    @Param('id') id: string,
    @Body() dto: CreatePermissionRequestDto,
    @Request() req: AuthedRequest,
  ) {
    return this.service.addRolesToRequest(id, req.user.username, dto);
  }

  /**
   * Remove pending roles from a request.
   * Only the request owner can call this.
   * If all roles are removed, the request is deleted and null is returned.
   */
  @Delete(':id/roles')
  removeRoles(
    @Param('id') id: string,
    @Body() dto: ReviewRolesDto,
    @Request() req: AuthedRequest,
  ) {
    return this.service.removeRolesFromRequest(id, req.user.username, dto);
  }

  /**
   * Approve specific roles within a request.
   * Body: { roles: ["STORE_USER"] } — list of roles to approve.
   *
   * - ANOMALY_ADMIN: can approve any roles (via guard bypass).
   * - FLOW_ADMIN: can only approve roles within their own flow.
   *
   * On approval, the user's document is created/updated with the approved roles.
   */
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @AdminRoles()
  approve(
    @Param('id') id: string,
    @Body() dto: ReviewRolesDto,
    @Request() req: AuthedRequest,
  ) {
    return this.service.approveRoles(id, dto, req.user.username, req.user.roles);
  }

  /**
   * Reject specific roles within a request.
   * Same scope rules as approve.
   */
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @AdminRoles()
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewRolesDto,
    @Request() req: AuthedRequest,
  ) {
    return this.service.rejectRoles(id, dto, req.user.username, req.user.roles);
  }
}
