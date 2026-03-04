import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { StoreManagementService } from './store-management.service';
import { CreateItemDto } from './dto/create-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/utils/roles.util';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('store')
export class StoreManagementController {
  constructor(private readonly service: StoreManagementService) {}

  /**
   * GET /store/items
   * Both STORE_ADMIN and STORE_USER can view items.
   * ANOMALY_ADMIN can access this via the ANOMALY_ADMIN bypass in RolesGuard.
   */
  @Get('items')
  @Roles(Role.STORE_ADMIN, Role.STORE_USER)
  findAll() {
    return this.service.findAll();
  }

  /**
   * POST /store/items
   * STORE_ADMIN only — create a new item.
   */
  @Post('items')
  @Roles(Role.STORE_ADMIN)
  create(@Body() dto: CreateItemDto) {
    return this.service.create(dto);
  }

  /**
   * DELETE /store/items/:id
   * STORE_ADMIN only — delete an item by ID.
   */
  @Delete('items/:id')
  @Roles(Role.STORE_ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
