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
  ParseEnumPipe,
} from '@nestjs/common';
import { PermissionRequestsService } from './permission-requests.service';
import { CreatePermissionRequestDto } from './dto/create-permission-request.dto';
import { ReviewRolesDto } from './dto/review-roles.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminRoles } from '../common/decorators/roles.decorator';
import { OverallRequestStatus } from './types/permission-request.types';
import { AuthedRequest } from '../common/interfaces/authed-request.interface';

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
  create(@Body() dto: CreatePermissionRequestDto, @Request() req: AuthedRequest) {
    return this.service.create(req.user.username, dto);
  }

  /**
   * GET /permission-requests
   * Admin-only — list requests scoped to the requester's flow(s).
   * ANOMALY_ADMIN sees all requests (via RolesGuard bypass).
   *
   * ?status=PENDING  → filter by computed overall status
   * ?username=alice  → partial case-insensitive live search by username
   */
  @Get()
  @UseGuards(RolesGuard)
  @AdminRoles()
  findAll(
    @Request() req: AuthedRequest,
    @Query('status', new ParseEnumPipe(OverallRequestStatus, { optional: true })) status?: OverallRequestStatus,
    @Query('username') username?: string,
  ) {
    return this.service.findAll(req.user.roles, status, username);
  }

  /**
   * GET /permission-requests/mine
   *
   * Returns the authenticated user's own permission requests.
   * No admin access — admins use GET /permission-requests?username= instead.
   *
   * Note: declared BEFORE /:id to prevent NestJS matching "mine" as an ID.
   */
  @Get('mine')
  findMine(@Request() req: AuthedRequest) {
    return this.service.findMine(req.user.username);
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
   * PATCH /permission-requests/:id/roles
   *
   * Add new roles to an existing permission request.
   * Only the request owner can call this — ownership is enforced in the service.
   *
   * Roles already present (in any status) are silently ignored.
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
    @Request() req: AuthedRequest,
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
    @Request() req: AuthedRequest,
  ) {
    return this.service.rejectRoles(id, dto, req.user.username, req.user.roles);
  }
}
