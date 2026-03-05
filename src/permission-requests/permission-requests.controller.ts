import {
  Controller,
  Get,
  Post,
  Patch,
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

@UseGuards(JwtAuthGuard)
@Controller('permission-requests')
export class PermissionRequestsController {
  constructor(private readonly service: PermissionRequestsService) {}

  /**
   * POST /permission-requests
   *
   * Any authenticated user (even with zero roles) can submit a request.
   * The requester's username is taken from the JWT payload — not from the body.
   *
   * JwtAuthGuard only (no RolesGuard) so zero-role users can access this.
   */
  @Post()
  create(@Body() dto: CreatePermissionRequestDto, @Request() req: any) {
    return this.service.create(req.user.username, dto);
  }

  /**
   * GET /permission-requests
   * All flow admins — list requests scoped to their flow(s).
   * ANOMALY_ADMIN sees all requests (via RolesGuard bypass).
   *
   * ?pending=true  → filter to only non-fully-resolved requests
   */
  @Get()
  @UseGuards(RolesGuard)
  @AdminRoles()
  findAll(@Request() req: any, @Query('status') status?: OverallRequestStatus) {
    return this.service.findAll(req.user.roles, status);
  }

  /**
   * GET /permission-requests/by-user/:username
   *
   * Fetch all requests for a specific username.
   *
   * - Any JWT holder can look up their OWN username.
   * - FLOW_ADMIN / ANOMALY_ADMIN can look up any username
   *   (useful for filtering pending requests before approval).
   *
   * JwtAuthGuard only — access control is enforced in the service.
   *
   * Note: declared BEFORE /:id to prevent NestJS matching "by-user" as an ID.
   */
  @Get('by-user/:username')
  findByUsername(@Param('username') username: string, @Request() req: any) {
    return this.service.findByUsername(username, req.user.username, req.user.roles);
  }

  /**
   * GET /permission-requests/:id
   * All flow admins — retrieve a single request by its MongoDB ID.
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @AdminRoles()
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  /**
   * PATCH /permission-requests/:id/approve
   *
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
    @Request() req: any,
  ) {
    return this.service.approveRoles(id, dto, req.user.username, req.user.roles);
  }

  /**
   * PATCH /permission-requests/:id/reject
   *
   * Reject specific roles within a request.
   * Same scope rules as approve.
   */
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @AdminRoles()
  reject(
    @Param('id') id: string,
    @Body() dto: ReviewRolesDto,
    @Request() req: any,
  ) {
    return this.service.rejectRoles(id, dto, req.user.username, req.user.roles);
  }
}
