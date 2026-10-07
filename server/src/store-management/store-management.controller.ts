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

// Default roles for this controller come from its owning flow module
// (see flows/store-flow.module.ts) — add @Roles()/@FlowRoles() here only
// if this controller needs to diverge from that default.
@UseGuards(JwtAuthGuard)
@Controller('store')
export class StoreManagementController {
  constructor(private readonly service: StoreManagementService) {}


  @Get('items')
  findAll() {
    return this.service.findAll();
  }


  @Post('items')
  create(@Body() dto: CreateItemDto) {
    return this.service.create(dto);
  }


  @Delete('items/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
