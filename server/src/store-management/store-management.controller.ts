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
import { FlowRoles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@FlowRoles('STORE')
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
