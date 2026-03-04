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
@Roles(Role.STORE_ADMIN, Role.STORE_USER)
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
